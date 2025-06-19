
import React, { useMemo } from 'react';
import { User, Student, Class as SchoolClass, UserRole } from '../../../types';
import { FilterType, EntityType } from './ManagementHub'; 
import Avatar from '../../UI/Avatar';
import Button from '../../UI/Button';
import { PencilSquareIcon, TrashIcon, LinkIcon, UserCircleIcon, AcademicCapIcon, RectangleStackIcon, TagIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { ROLE_DISPLAY_NAMES } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth'; 
import { MASTER_CLASS_ID } from '../../../services/apiService'; 

interface UnifiedEntityListProps {
    users: User[];
    students: Student[];
    classes: SchoolClass[];
    activeFilter: FilterType;
    searchTerm: string;
    visibleColumns: string[]; // Changed from showDetailsColumn
    onEdit: (item: User | Student | SchoolClass, type: EntityType) => void;
    onDelete: (itemId: string, itemName: string, type: EntityType) => void;
    onManageLinks: (item: User | Student | SchoolClass, type: 'user' | 'student' | 'class') => void;
    isLoading: boolean;
}

const columnHeaders: Record<string, string> = {
    name: 'Entity Name',
    typeDisplay: 'Type / Role',
    details: 'Details',
    linksSummary: 'Links Summary',
    actions: 'Actions',
};

const UnifiedEntityList: React.FC<UnifiedEntityListProps> = ({
    users,
    students,
    classes,
    activeFilter,
    searchTerm,
    visibleColumns, // Changed from showDetailsColumn
    onEdit,
    onDelete,
    onManageLinks,
    isLoading
}) => {
    const { currentUser } = useAuth(); 

    const getEntityTypeIcon = (type: EntityType, role?: UserRole) => {
        if (type === 'USER' && role === UserRole.STUDENT_USER) return IdentificationIcon; 
        switch(type) {
            case 'USER': return UserCircleIcon;
            case 'STUDENT': return AcademicCapIcon;
            case 'CLASS': return RectangleStackIcon;
            default: return TagIcon;
        }
    };

    const getLinksSummary = (item: User | Student | SchoolClass, type: EntityType): string => {
        if (type === 'USER') {
            const user = item as User;
            if (user.role === UserRole.TEACHER) return `Classes: ${user.classIds?.length || 0}`;
            if (user.role === UserRole.PARENT) return `Children: ${user.childStudentIds?.length || 0}`;
            if (user.role === UserRole.STUDENT_USER) {
                const studentRecord = students.find(s => s.id === user.studentId);
                return studentRecord ? `Student Record | Class: ${studentRecord.classId ? 'Yes' : 'No'}` : 'Student Record';
            }
            return 'N/A';
        }
        if (type === 'STUDENT') {
            const student = item as Student;
            const classCount = student.classId ? 1 : 0;
            return `Parents: ${student.parentIds?.length || 0} | Class: ${classCount}`;
        }
        if (type === 'CLASS') {
            const schoolClass = item as SchoolClass;
            return `Teachers: ${schoolClass.teacherIds?.length || 0} | Students: ${schoolClass.studentIds?.length || 0}`;
        }
        return '';
    };


    const combinedList = useMemo(() => {
        let allEntities: Array<{ item: User | Student | SchoolClass; type: EntityType; typeDisplay: string, entityIcon: React.ElementType, originalRole?: UserRole }> = [];
        
        if (activeFilter === 'ALL' || activeFilter === 'USER') {
            users.forEach(u => allEntities.push({ 
                item: u, 
                type: 'USER', 
                typeDisplay: ROLE_DISPLAY_NAMES[u.role], 
                entityIcon: getEntityTypeIcon('USER', u.role),
                originalRole: u.role
            }));
        }
        if (activeFilter === 'ALL' || activeFilter === 'STUDENT') {
            students.forEach(s => {
                if (!(activeFilter === 'ALL' && s.hasUserProfile && users.some(u => u.studentId === s.id))) {
                     allEntities.push({ 
                        item: s, 
                        type: 'STUDENT', 
                        typeDisplay: 'Student Record', 
                        entityIcon: getEntityTypeIcon('STUDENT') 
                    });
                }
            });
        }
        if (activeFilter === 'ALL' || activeFilter === 'CLASS') {
            classes.forEach(c => allEntities.push({ item: c, type: 'CLASS', typeDisplay: 'Class', entityIcon: getEntityTypeIcon('CLASS') }));
        }
        
        if (searchTerm.trim() !== '') {
            const lowerSearchTerm = searchTerm.toLowerCase();
            allEntities = allEntities.filter(({ item, type }) => {
                if (item.name.toLowerCase().includes(lowerSearchTerm)) return true;
                if (type === 'USER' && (item as User).email?.toLowerCase().includes(lowerSearchTerm)) return true;
                return false;
            });
        }

        return allEntities.sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return a.item.name.localeCompare(b.item.name);
        });
    }, [users, students, classes, activeFilter, searchTerm]);

    const renderCellContent = (itemData: { item: User | Student | SchoolClass; type: EntityType; typeDisplay: string, entityIcon: React.ElementType, originalRole?: UserRole }, columnKey: string) => {
        const { item, type, typeDisplay, entityIcon: EntityIcon, originalRole } = itemData;

        switch (columnKey) {
            case 'name':
                return (
                    <div className="flex items-center">
                        {(item as User | Student).avatarUrl ? (
                            <Avatar src={(item as User | Student).avatarUrl} alt={item.name} size="sm" className="mr-3 flex-shrink-0" />
                        ) : (
                            <EntityIcon className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <div className="text-sm font-medium text-neutral-dark truncate" title={item.name}>{item.name}</div>
                    </div>
                );
            case 'typeDisplay':
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        type === 'USER' ? ( (originalRole === UserRole.ADMIN ? 'bg-red-100 text-red-800' : originalRole === UserRole.TEACHER ? 'bg-blue-100 text-blue-800' : originalRole === UserRole.PARENT ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' /* STUDENT_USER */ ) ) :
                        type === 'STUDENT' ? 'bg-indigo-100 text-indigo-800' :
                        type === 'CLASS' && item.id === MASTER_CLASS_ID ? 'bg-purple-200 text-purple-900 font-bold' : 
                        'bg-purple-100 text-purple-800' 
                    }`}>
                        {typeDisplay}
                    </span>
                );
            case 'details':
                if (type === 'USER') return <span>{(item as User).email}</span>;
                if (type === 'STUDENT') return (
                    <span>
                        ID: {(item as Student).id.slice(-6)} 
                        {(item as Student).hasUserProfile && <span className="ml-2 text-green-600 font-semibold">(Has Login)</span>}
                    </span>
                );
                if (type === 'CLASS') return <span>ID: {(item as SchoolClass).id.slice(-6)}</span>;
                return null;
            case 'linksSummary':
                return getLinksSummary(item, type);
            case 'actions':
                let canBeDeleted = true;
                let canManageLinks = true;

                if (type === 'CLASS' && item.id === MASTER_CLASS_ID) canBeDeleted = false;
                if (type === 'USER' && originalRole === UserRole.ADMIN && item.id === currentUser?.id) canBeDeleted = false;
                if (type === 'USER' && (originalRole === UserRole.STUDENT_USER || originalRole === UserRole.ADMIN )) canManageLinks = false; 

                return (
                    <div className="space-x-1">
                        <Button onClick={() => onEdit(item, type)} variant="ghost" size="sm" aria-label={`Edit ${item.name}`} title="Edit Properties" disabled={isLoading}>
                            <PencilSquareIcon className="h-5 w-5" />
                        </Button>
                        {canManageLinks && (
                            <Button onClick={() => onManageLinks(item, type.toLowerCase() as 'user' | 'student' | 'class')} variant="ghost" size="sm" aria-label={`Manage links for ${item.name}`} title="Manage Links" disabled={isLoading}>
                                <LinkIcon className="h-5 w-5" />
                            </Button>
                        )}
                        {canBeDeleted && (
                            <Button onClick={() => onDelete(item.id, item.name, type)} variant="ghost" size="sm" className="text-danger hover:bg-red-100" aria-label={`Delete ${item.name}`} title="Delete Entity" disabled={isLoading}>
                                <TrashIcon className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };


    if (isLoading && combinedList.length === 0) {
        return <div className="p-6 text-center text-gray-500">Refreshing data...</div>;
    }

    if (combinedList.length === 0) {
         if (searchTerm.trim() !== '') {
            return <div className="p-10 text-center text-gray-500">
                <h3 className="text-lg font-semibold">No entities match your search for "{searchTerm}".</h3>
                <p className="mt-1">Try a different search term or clear the search.</p>
            </div>;
        }
        return <div className="p-10 text-center text-gray-500">
            <h3 className="text-lg font-semibold">No entities found.</h3>
            <p className="mt-1">Try a different filter or create new entities using the "Create New Entity" button.</p>
        </div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {visibleColumns.map(colKey => (
                             <th 
                                key={colKey} 
                                scope="col" 
                                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${ (colKey === 'details') ? 'hidden md:table-cell' : '' }`}
                             >
                                {columnHeaders[colKey] || colKey}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {combinedList.map((entityData) => (
                        <tr key={`${entityData.type}-${entityData.item.id}`}>
                            {visibleColumns.map(colKey => (
                                <td 
                                    key={`${entityData.type}-${entityData.item.id}-${colKey}`} 
                                    className={`px-4 py-4 whitespace-nowrap text-sm text-gray-500 ${ (colKey === 'details') ? 'hidden md:table-cell' : '' } ${colKey === 'name' ? 'font-medium text-neutral-dark' : '' }`}
                                >
                                    {renderCellContent(entityData, colKey)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UnifiedEntityList;
