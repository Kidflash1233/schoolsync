
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    fetchAllUsers,
    fetchAllStudents,
    fetchAllClasses,
    createUser,
    createStudent,
    createClass,
    updateUser,
    updateStudent,
    updateClass,
    deleteUser,
    deleteStudent,
    deleteClass,
    CreateStudentPayload, 
} from '../../../services/apiService';
import { User, Student, Class as SchoolClass, UserRole } from '../../../types';
import Button from '../../UI/Button';
import LoadingSpinner from '../../UI/LoadingSpinner';
import Card from '../../UI/Card';
import Input from '../../UI/Input';
import UnifiedEntityList from './UnifiedEntityList';
import CreateEntityWizardModal from './CreateEntityWizardModal';
import ManageLinksModal from './ManageLinksModal';
import RoleCodeHistoryViewer from '../RoleCodeHistoryViewer'; 
import { PlusCircleIcon, UsersIcon, AcademicCapIcon, RectangleStackIcon, AdjustmentsHorizontalIcon, KeyIcon, ChevronDownIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';

export type EntityType = 'USER' | 'STUDENT' | 'CLASS';
export type FilterType = EntityType | 'ALL' | 'ROLE_CODE_HISTORY'; 

type FormDataForModal = Partial<User & Student & SchoolClass & { role: UserRole; createProfile?: boolean; email?: string }>;

const ALL_TOGGLEABLE_COLUMNS = [
    { key: 'details', label: 'Details (Email/ID)' },
    { key: 'linksSummary', label: 'Links Summary' },
];
const FIXED_COLUMNS_START = ['name', 'typeDisplay'];
const FIXED_COLUMNS_END = ['actions'];


const ManagementHub: React.FC = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const [userSelectedColumns, setUserSelectedColumns] = useState<string[]>(['details', 'linksSummary']);
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState<boolean>(false);
    const columnDropdownRef = useRef<HTMLDivElement>(null);


    const [isCreateWizardOpen, setIsCreateWizardOpen] = useState<boolean>(false);
    const [entityToEdit, setEntityToEdit] = useState<User | Student | SchoolClass | null>(null);
    
    const [isLinksModalOpen, setIsLinksModalOpen] = useState<boolean>(false);
    const [itemForLinks, setItemForLinks] = useState<User | Student | SchoolClass | null>(null);
    const [linksModalItemType, setLinksModalItemType] = useState<'user' | 'student' | 'class'>('user');
    
    const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);


    const refreshHubData = useCallback(async (showSuccessMessage?: string) => {
        if (activeFilter !== 'ROLE_CODE_HISTORY') {
            setIsLoading(true);
        }
        setError(null);
        if(!showSuccessMessage) setOperationStatus(null); 
        try {
            if (activeFilter !== 'ROLE_CODE_HISTORY') {
                const [fetchedUsers, fetchedStudents, fetchedClasses] = await Promise.all([
                    fetchAllUsers(),
                    fetchAllStudents(),
                    fetchAllClasses(),
                ]);
                setAllUsers(fetchedUsers);
                setAllStudents(fetchedStudents);
                setAllClasses(fetchedClasses);
            }
            if (showSuccessMessage) {
                setOperationStatus({ type: 'success', message: showSuccessMessage });
            }
        } catch (err) {
            console.error("ManagementHub: Failed to load data", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to load management data: ${errorMessage}`);
            setOperationStatus({ type: 'error', message: `Failed to refresh data: ${errorMessage}` });
        } finally {
             if (activeFilter !== 'ROLE_CODE_HISTORY') {
                setIsLoading(false);
            }
        }
    }, [activeFilter]); 

    useEffect(() => {
        if (activeFilter !== 'ROLE_CODE_HISTORY') {
            refreshHubData();
        }
    }, [refreshHubData, activeFilter]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target as Node)) {
                setIsColumnDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleColumn = (columnKey: string) => {
        setUserSelectedColumns(prev => 
            prev.includes(columnKey) 
                ? prev.filter(col => col !== columnKey)
                : [...prev, columnKey]
        );
    };

    const finalVisibleColumns = useMemo(() => {
        const dynamicCols = userSelectedColumns.filter(col => !FIXED_COLUMNS_END.includes(col));
        return [...FIXED_COLUMNS_START, ...dynamicCols, ...FIXED_COLUMNS_END];
    }, [userSelectedColumns]);


    const handleOpenCreateWizard = () => {
        setEntityToEdit(null);
        setOperationStatus(null);
        setIsCreateWizardOpen(true);
    };
    
    const handleOpenEditPropertiesModal = (item: User | Student | SchoolClass, type: EntityType) => {
        setOperationStatus(null);
        setEntityToEdit(item);
        setIsCreateWizardOpen(true); 
    };

    const handleCloseCreateWizard = () => {
        setIsCreateWizardOpen(false);
        setEntityToEdit(null);
    };

    const handleOpenLinksModal = (item: User | Student | SchoolClass, type: 'user' | 'student' | 'class') => {
        setOperationStatus(null);
        setItemForLinks(item);
        setLinksModalItemType(type);
        setIsLinksModalOpen(true);
    };

    const handleCloseLinksModal = () => {
        setIsLinksModalOpen(false);
        setItemForLinks(null);
    };
    
    const handleSaveEntityProperties = async (
        entityData: FormDataForModal, 
        entityType: EntityType,
        mode: 'create' | 'edit'
    ): Promise<{ entity: User | Student | SchoolClass, invitationCode?: string } | null> => {
        setOperationStatus(null);
        let entityName = entityData.name || 'Unknown Entity';
        
        try {
            let resultForModal: { entity: User | Student | SchoolClass, invitationCode?: string } | null = null;

            if (mode === 'create') {
                switch (entityType) {
                    case 'USER':
                        const userResp = await createUser(entityData as Omit<User, 'id'>);
                        resultForModal = { entity: userResp.user, invitationCode: userResp.invitationCode };
                        entityName = userResp.user.name;
                        break;
                    case 'STUDENT':
                        const studentPayload: CreateStudentPayload = {
                            name: entityData.name!,
                            avatarUrl: entityData.avatarUrl,
                            classId: (entityData as Partial<Student>).classId || '',
                            parentIds: (entityData as Partial<Student>).parentIds || [],
                            createProfile: entityData.createProfile,
                            email: entityData.email,
                        };
                        const studentResp = await createStudent(studentPayload);
                        resultForModal = { 
                            entity: studentResp.student, 
                            invitationCode: studentResp.userCreationResponse?.invitationCode 
                        };
                        entityName = studentResp.student.name;
                        break;
                    case 'CLASS':
                        const newClass = await createClass(entityData as Omit<SchoolClass, 'id' | 'studentIds' | 'teacherIds'>);
                        resultForModal = { entity: newClass };
                        entityName = newClass.name;
                        break;
                }
                 await refreshHubData(`Successfully created ${entityType.toLowerCase()} '${entityName}'.`);
                 return resultForModal;

            } else if (mode === 'edit' && entityData.id) {
                 let savedEntity: User | Student | SchoolClass | undefined;
                 switch (entityType) {
                    case 'USER':
                        savedEntity = await updateUser(entityData.id, entityData as Partial<User>);
                        break;
                    case 'STUDENT':
                        const studentEditPayload = { ...entityData };
                        delete studentEditPayload.createProfile;
                        delete studentEditPayload.email;
                        savedEntity = await updateStudent(entityData.id, studentEditPayload as Partial<Student>);
                        break;
                    case 'CLASS':
                        savedEntity = await updateClass(entityData.id, entityData as Partial<SchoolClass>);
                        break;
                }
                entityName = (savedEntity as User | Student | SchoolClass)?.name || entityName;
                await refreshHubData(`Successfully updated ${entityType.toLowerCase()} '${entityName}'.`);
                return savedEntity ? { entity: savedEntity } : null;
            }
            return null;
        } catch (err) {
            console.error("Error saving entity properties:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setOperationStatus({ type: 'error', message: `Failed to save ${entityType.toLowerCase()}: ${message}` });
            throw err; 
        }
    };
    
    const handleSaveLinks = async (
        itemId: string,
        rawUpdates: Partial<User | Student | SchoolClass> | { teacherIds?: string[]; studentIdsToAssign?: string[] },
        itemType: 'user' | 'student' | 'class' 
    ) => {
        setOperationStatus(null);
        try {
            let effectiveUpdates = rawUpdates;
            if (itemType === 'class' && 'studentIdsToAssign' in rawUpdates) {
                const classUpdates = rawUpdates as { teacherIds?: string[]; studentIdsToAssign?: string[] };
                effectiveUpdates = {
                    teacherIds: classUpdates.teacherIds,
                    studentIds: classUpdates.studentIdsToAssign 
                };
            }
    
            switch (itemType) { 
                case 'user': 
                    await updateUser(itemId, effectiveUpdates as Partial<User>); 
                    break;
                case 'student': 
                    await updateStudent(itemId, effectiveUpdates as Partial<Student>); 
                    break;
                case 'class': 
                    await updateClass(itemId, effectiveUpdates as Partial<SchoolClass>); 
                    break;
            }
            await refreshHubData(`Links for ${itemType} updated successfully.`); 
            handleCloseLinksModal();
        } catch (err) {
            console.error("Error saving links:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setOperationStatus({ type: 'error', message: `Failed to save links: ${message}` });
            if (activeFilter !== 'ROLE_CODE_HISTORY') setIsLoading(false); 
            throw err; 
        }
    };

    const handleDeleteItem = async (itemId: string, itemName: string, itemTypeToDelete: EntityType) => {
        if (!window.confirm(`Are you sure you want to delete ${itemTypeToDelete.toLowerCase()} "${itemName}"? This action cannot be undone.`)) return;
        setOperationStatus(null);
        try {
            switch (itemTypeToDelete) {
                case 'USER': await deleteUser(itemId); break;
                case 'STUDENT': await deleteStudent(itemId); break;
                case 'CLASS': await deleteClass(itemId); break;
            }
            await refreshHubData(`${itemTypeToDelete} "${itemName}" deleted successfully.`);
        } catch (err) {
            console.error(`Failed to delete ${itemTypeToDelete}:`, err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setOperationStatus({ type: 'error', message: `Failed to delete ${itemTypeToDelete.toLowerCase()} '${itemName}': ${message}` });
           if (activeFilter !== 'ROLE_CODE_HISTORY') setIsLoading(false);
        }
    };
    
    const filterButtons: { label: string; value: FilterType; icon: React.ElementType }[] = [
        { label: 'All', value: 'ALL', icon: AdjustmentsHorizontalIcon },
        { label: 'Users', value: 'USER', icon: UsersIcon },
        { label: 'Students', value: 'STUDENT', icon: AcademicCapIcon },
        { label: 'Classes', value: 'CLASS', icon: RectangleStackIcon },
        { label: 'Codes', value: 'ROLE_CODE_HISTORY', icon: KeyIcon }, 
    ];

    const handleFilterChange = (newFilter: FilterType) => {
        setActiveFilter(newFilter);
        setSearchTerm(''); 
        if (newFilter !== 'ROLE_CODE_HISTORY' && !isLoading) {
            refreshHubData();
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-textDisplay">Entity Management Hub</h1>
                    <p className="text-textSubtle text-sm mt-0.5">Create, view, edit, and link all platform entities.</p>
                </div>
                {activeFilter !== 'ROLE_CODE_HISTORY' && ( 
                     <Button 
                        onClick={handleOpenCreateWizard} 
                        variant="primary" 
                        size="md" 
                        disabled={isLoading}
                        className="flex-shrink-0"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-1.5 inline" /> Create New
                    </Button>
                )}
            </div>
            
             {operationStatus && (
                <div className={`p-2.5 rounded-md text-sm text-center ${operationStatus.type === 'success' ? 'bg-success-bgLight text-success-textDark border border-success-borderLight' : 'bg-danger-bgLight text-danger-textDark border border-danger-borderLight'}`}>
                    {operationStatus.message}
                </div>
            )}
            {error && !operationStatus && <p className="text-danger-textDark text-center p-2.5 bg-danger-bgLight rounded-md border border-danger-borderLight">{error}</p>}


            <Card className="shadow-md"> {/* Added shadow-md */}
                 <div className="p-3 border-b border-borderLight">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        {activeFilter !== 'ROLE_CODE_HISTORY' && (
                             <Input
                                type="search"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:max-w-xs lg:max-w-sm !py-1.5" // Compact input
                                containerClassName="!mb-0"
                                aria-label="Search entities"
                            />
                        )}
                        <div className={`flex flex-wrap gap-1.5 items-center ${activeFilter === 'ROLE_CODE_HISTORY' ? 'w-full md:w-auto md:justify-end' : 'md:ml-auto'}`}>
                            {/* <span className="text-xs font-medium text-textSubtle mr-1 hidden sm:inline">View:</span> */}
                            {filterButtons.map(fb => (
                                <Button
                                    key={fb.value}
                                    onClick={() => handleFilterChange(fb.value)}
                                    variant={activeFilter === fb.value ? 'primary' : 'secondary'}
                                    size="sm"
                                    className="!px-2.5 !py-1 text-xs"
                                    disabled={isLoading && activeFilter !== 'ROLE_CODE_HISTORY' && fb.value !== 'ROLE_CODE_HISTORY'}
                                    aria-pressed={activeFilter === fb.value}
                                >
                                    <fb.icon className="h-4 w-4 mr-1 inline" /> {fb.label}
                                </Button>
                            ))}
                            {activeFilter !== 'ROLE_CODE_HISTORY' && (
                                <div className="relative" ref={columnDropdownRef}>
                                    <Button
                                        onClick={() => setIsColumnDropdownOpen(prev => !prev)}
                                        variant="secondary"
                                        size="sm"
                                        className="!px-2.5 !py-1 text-xs"
                                        aria-haspopup="true"
                                        aria-expanded={isColumnDropdownOpen}
                                        aria-controls="column-options"
                                    >
                                        <ViewColumnsIcon className="h-4 w-4 mr-1 inline" /> Columns <ChevronDownIcon className={`h-3 w-3 ml-0.5 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    {isColumnDropdownOpen && (
                                        <div id="column-options" className="absolute right-0 mt-1.5 w-56 bg-bgSurface rounded-md shadow-lg z-20 border border-borderDefault py-1">
                                            <p className="px-3 py-1.5 text-xs font-semibold text-textBody">Toggle Columns</p>
                                            {ALL_TOGGLEABLE_COLUMNS.map(col => (
                                                <label key={col.key} className="flex items-center px-3 py-1.5 hover:bg-bgMuted cursor-pointer text-xs text-textBody">
                                                    <input
                                                        type="checkbox"
                                                        checked={userSelectedColumns.includes(col.key)}
                                                        onChange={() => handleToggleColumn(col.key)}
                                                        className="h-3.5 w-3.5 text-primary border-borderDefault rounded focus:ring-primary mr-2"
                                                    />
                                                    {col.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {activeFilter === 'ROLE_CODE_HISTORY' ? (
                    <RoleCodeHistoryViewer />
                ) : isLoading && (allUsers.length === 0 && allStudents.length === 0 && allClasses.length === 0) ? (
                    <div className="flex justify-center items-center py-16">
                        <LoadingSpinner size="lg" />
                        <p className="ml-3 text-textSubtle">Loading entities...</p>
                    </div>
                ) : (
                    <UnifiedEntityList
                        users={allUsers}
                        students={allStudents}
                        classes={allClasses}
                        activeFilter={activeFilter}
                        searchTerm={searchTerm}
                        visibleColumns={finalVisibleColumns}
                        onEdit={handleOpenEditPropertiesModal}
                        onDelete={handleDeleteItem}
                        onManageLinks={handleOpenLinksModal}
                        isLoading={isLoading}
                    />
                )}
            </Card>

            {isCreateWizardOpen && (
                 <CreateEntityWizardModal
                    isOpen={isCreateWizardOpen}
                    onClose={handleCloseCreateWizard}
                    onSave={handleSaveEntityProperties}
                    existingEntity={entityToEdit}
                    allUsers={allUsers} 
                    allClasses={allClasses} 
                    onOpenLinksModal={handleOpenLinksModal}
                    isLoadingExternally={isLoading}
                />
            )}
            
            {itemForLinks && isLinksModalOpen && (
                <ManageLinksModal
                    isOpen={isLinksModalOpen}
                    onClose={handleCloseLinksModal}
                    item={itemForLinks}
                    itemType={linksModalItemType}
                    allUsers={allUsers}
                    allStudents={allStudents}
                    allClasses={allClasses}
                    onSaveLinks={handleSaveLinks}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default ManagementHub;