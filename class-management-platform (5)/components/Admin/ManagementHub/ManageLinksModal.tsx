import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import Modal from '../../UI/Modal';
import Button from '../../UI/Button';
import Input from '../../UI/Input'; // For search filters
import { User, Student, Class as SchoolClass, UserRole } from '../../../types';
import Avatar from '../../UI/Avatar';

interface ManageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: User | Student | SchoolClass | null;
  itemType: 'user' | 'student' | 'class';
  allUsers: User[];
  allStudents: Student[];
  allClasses: SchoolClass[];
  onSaveLinks: (itemId: string, updates: Partial<User | Student | SchoolClass> | { teacherIds?: string[]; studentIdsToAssign?: string[] }, itemType: 'user' | 'student' | 'class') => Promise<void>;
  isLoading: boolean;
}

const ItemCheckboxList: React.FC<{
  items: Array<{ id: string; name: string; email?: string; currentLink?: string }>;
  selectedIds: string[];
  onCheckboxChange: (id: string) => void;
  listHeight?: string;
  disabled?: boolean;
  filterTerm: string;
  setFilterTerm: (term: string) => void;
  filterPlaceholder?: string;
}> = ({ items, selectedIds, onCheckboxChange, listHeight = 'h-40', disabled, filterTerm, setFilterTerm, filterPlaceholder="Search..." }) => {
  const filteredItems = useMemo(() => {
    if (!filterTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(filterTerm.toLowerCase()))
    );
  }, [items, filterTerm]);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        placeholder={filterPlaceholder}
        value={filterTerm}
        onChange={(e) => setFilterTerm(e.target.value)}
        className="w-full text-sm"
        containerClassName="!mb-1"
      />
      {filteredItems.length === 0 && filterTerm && <p className="text-xs text-gray-500 px-2">No matches for "{filterTerm}".</p>}
      {filteredItems.length === 0 && !filterTerm && items.length > 0 && <p className="text-xs text-gray-500 px-2">No items to display with current filter.</p>}
      {items.length === 0 && !filterTerm && <p className="text-xs text-gray-500 px-2">No items available.</p>}

      <div className={`${listHeight} overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 bg-white`}>
        {filteredItems.map(listItem => (
          <div key={listItem.id} className="flex items-center p-1.5 hover:bg-gray-100 rounded">
            <input
              id={`${listItem.id}-checkbox`}
              type="checkbox"
              checked={selectedIds.includes(listItem.id)}
              onChange={() => onCheckboxChange(listItem.id)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-3 shrink-0"
              disabled={disabled}
            />
            <label htmlFor={`${listItem.id}-checkbox`} className="text-sm text-neutral-dark flex-grow">
              {listItem.name}
              {listItem.email && <span className="text-xs text-gray-500 ml-1">({listItem.email})</span>}
              {listItem.currentLink && <span className="text-xs text-indigo-500 ml-1 italic">({listItem.currentLink})</span>}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};


const ManageLinksModal: React.FC<ManageLinksModalProps> = ({
  isOpen,
  onClose,
  item,
  itemType,
  allUsers,
  allStudents,
  allClasses,
  onSaveLinks,
  isLoading
}) => {
  // State for selected IDs
  const [selectedClassIdsForTeacher, setSelectedClassIdsForTeacher] = useState<string[]>([]);
  const [selectedChildStudentIdsForParent, setSelectedChildStudentIdsForParent] = useState<string[]>([]);
  const [selectedParentIdsForStudent, setSelectedParentIdsForStudent] = useState<string[]>([]);
  const [selectedClassIdForStudent, setSelectedClassIdForStudent] = useState<string>(''); // Single for student's class
  const [selectedTeacherIdsForClass, setSelectedTeacherIdsForClass] = useState<string[]>([]); // Multiple teachers for a class
  const [selectedStudentIdsForClass, setSelectedStudentIdsForClass] = useState<string[]>([]);

  // State for search filters
  const [classFilter, setClassFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');

  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setModalError(null);
    // Reset filters on open or item change
    setClassFilter(''); setStudentFilter(''); setParentFilter(''); setTeacherFilter('');

    if (item && isOpen) {
      if (itemType === 'user') {
        const userItem = item as User;
        if (userItem.role === UserRole.TEACHER) {
          setSelectedClassIdsForTeacher(userItem.classIds || []);
        } else if (userItem.role === UserRole.PARENT) {
          setSelectedChildStudentIdsForParent(userItem.childStudentIds || []);
        }
      } else if (itemType === 'student') {
        const studentItem = item as Student;
        setSelectedParentIdsForStudent(studentItem.parentIds || []);
        setSelectedClassIdForStudent(studentItem.classId || '');
      } else if (itemType === 'class') {
        const classItem = item as SchoolClass;
        setSelectedTeacherIdsForClass(classItem.teacherIds || []);
        setSelectedStudentIdsForClass(classItem.studentIds || []);
      }
    } else { // Reset states if modal is closed or item is null
      setSelectedClassIdsForTeacher([]);
      setSelectedChildStudentIdsForParent([]);
      setSelectedParentIdsForStudent([]);
      setSelectedClassIdForStudent('');
      setSelectedTeacherIdsForClass([]);
      setSelectedStudentIdsForClass([]);
    }
  }, [item, itemType, isOpen]);

  const availableParents = allUsers.filter(u => u.role === UserRole.PARENT);
  const availableTeachers = allUsers.filter(u => u.role === UserRole.TEACHER);

  const handleCheckboxChange = (id: string, setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelectedIds(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(existingId => existingId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSave = async () => {
    if (!item) return;
    setModalError(null);
    let updates: Partial<User | Student | SchoolClass> | { teacherIds?: string[]; studentIdsToAssign?: string[] } = {};

    try {
      if (itemType === 'user') {
        const userItem = item as User;
        if (userItem.role === UserRole.TEACHER) {
          updates = { classIds: selectedClassIdsForTeacher };
        } else if (userItem.role === UserRole.PARENT) {
          updates = { childStudentIds: selectedChildStudentIdsForParent };
        }
      } else if (itemType === 'student') {
        updates = { parentIds: selectedParentIdsForStudent, classId: selectedClassIdForStudent };
      } else if (itemType === 'class') {
        updates = { 
            teacherIds: selectedTeacherIdsForClass, 
            studentIdsToAssign: selectedStudentIdsForClass 
        };
      }
      await onSaveLinks(item.id, updates, itemType);
      onClose();
    } catch (error) {
        console.error("Error saving links:", error);
        setModalError(error instanceof Error ? error.message : "Failed to save links.");
    }
  };

  const getModalTitle = (): ReactNode => {
    if (!item) return "Manage Links";
    
    // Check if item has avatarUrl (User or Student)
    let avatarSrc: string | undefined = undefined;
    if (itemType === 'user' || itemType === 'student') {
      avatarSrc = (item as User | Student).avatarUrl;
    }

    return (
      <div className="flex items-center">
        {avatarSrc && <Avatar src={avatarSrc} alt={item.name} size="sm" className="mr-2"/>}
        Manage Links for {item.name}
      </div>
    );
  };

  if (!item) return null;

  const renderContent = () => {
    if (itemType === 'user') {
      const userItem = item as User;
      if (userItem.role === UserRole.TEACHER) {
        return (
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Assign Classes to {userItem.name}</label>
            <ItemCheckboxList
              items={allClasses.map(c => ({ id: c.id, name: c.name, currentLink: c.teacherIds.includes(userItem.id) ? 'Currently assigned' : undefined }))}
              selectedIds={selectedClassIdsForTeacher}
              onCheckboxChange={(id) => handleCheckboxChange(id, setSelectedClassIdsForTeacher)}
              disabled={isLoading || allClasses.length === 0}
              filterTerm={classFilter}
              setFilterTerm={setClassFilter}
              filterPlaceholder="Search classes..."
            />
          </div>
        );
      } else if (userItem.role === UserRole.PARENT) {
        return (
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Link Children (Students) to {userItem.name}</label>
            <ItemCheckboxList
              items={allStudents.map(s => ({id: s.id, name: s.name, currentLink: s.parentIds?.includes(userItem.id) ? 'Currently linked' : undefined }))}
              selectedIds={selectedChildStudentIdsForParent}
              onCheckboxChange={(id) => handleCheckboxChange(id, setSelectedChildStudentIdsForParent)}
              disabled={isLoading || allStudents.length === 0}
              filterTerm={studentFilter}
              setFilterTerm={setStudentFilter}
              filterPlaceholder="Search students..."
            />
          </div>
        );
      } else if (userItem.role === UserRole.ADMIN) {
        return <p className="text-sm text-gray-500 text-center py-4">Administrators do not have direct data links (e.g., to classes or specific students) in this system.</p>;
      }
    } else if (itemType === 'student') {
      const studentItem = item as Student;
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Link Parents for {studentItem.name}</label>
             <ItemCheckboxList
              items={availableParents.map(p => ({ id: p.id, name: p.name, email: p.email, currentLink: p.childStudentIds?.includes(studentItem.id) ? 'Currently linked' : undefined }))}
              selectedIds={selectedParentIdsForStudent}
              onCheckboxChange={(id) => handleCheckboxChange(id, setSelectedParentIdsForStudent)}
              disabled={isLoading || availableParents.length === 0}
              filterTerm={parentFilter}
              setFilterTerm={setParentFilter}
              filterPlaceholder="Search parents..."
            />
          </div>
          <div>
            <label htmlFor="studentClassIdSelect" className="block text-sm font-medium text-neutral-dark mb-1 mt-3">Assign Class for {studentItem.name}</label>
            <select
              id="studentClassIdSelect"
              value={selectedClassIdForStudent}
              onChange={(e) => setSelectedClassIdForStudent(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white"
              disabled={isLoading || allClasses.length === 0}
            >
              <option value="">-- Unassigned --</option>
              {allClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </>
      );
    } else if (itemType === 'class') {
      const classItem = item as SchoolClass;
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Assign Teacher(s) to {classItem.name}</label>
            <ItemCheckboxList
              items={availableTeachers.map(t => ({id: t.id, name: t.name, email: t.email, currentLink: t.classIds?.includes(classItem.id) ? 'Currently teaches' : undefined }))}
              selectedIds={selectedTeacherIdsForClass}
              onCheckboxChange={(id) => handleCheckboxChange(id, setSelectedTeacherIdsForClass)}
              disabled={isLoading || availableTeachers.length === 0}
              filterTerm={teacherFilter}
              setFilterTerm={setTeacherFilter}
              filterPlaceholder="Search teachers..."
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-neutral-dark mb-1">Assign Students to {classItem.name}</label>
             <ItemCheckboxList
              items={allStudents.map(s => ({id: s.id, name: s.name, currentLink: s.classId === classItem.id ? 'Currently enrolled' : (s.classId ? `Enrolled in ${allClasses.find(c=>c.id === s.classId)?.name || 'other'}`: undefined) }))}
              selectedIds={selectedStudentIdsForClass}
              onCheckboxChange={(id) => handleCheckboxChange(id, setSelectedStudentIdsForClass)}
              disabled={isLoading || allStudents.length === 0}
              filterTerm={studentFilter}
              setFilterTerm={setStudentFilter}
              filterPlaceholder="Search students..."
            />
          </div>
        </>
      );
    }
    return null;
  };

  const showSaveButton = !(itemType === 'user' && (item as User).role === UserRole.ADMIN);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      <div className="space-y-4 bg-gray-50 p-4 rounded-b-md max-h-[70vh] overflow-y-auto">
        {modalError && <p className="text-sm text-center text-danger p-2 bg-red-100 rounded-md border border-red-200 mb-2">{modalError}</p>}
        {renderContent()}
      </div>
      <div className="bg-gray-100 px-6 py-3 sm:flex sm:flex-row-reverse rounded-b-lg">
          <Button onClick={handleSave} isLoading={isLoading} disabled={isLoading || !showSaveButton} className="sm:ml-3">Save Links</Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="mt-2 sm:mt-0">Cancel</Button>
      </div>
    </Modal>
  );
};

export default ManageLinksModal;