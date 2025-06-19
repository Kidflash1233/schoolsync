
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useAuth } from '../../hooks/useAuth';
import { createPost, fetchClassesByTeacherId, fetchStudentsByClassId } from '../../services/apiService';
import { UserRole, PostType, Class, Student } from '../../types';
import Select from 'react-select'; // Using react-select for multi-select

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

interface OptionType {
  value: string;
  label: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const { currentUser } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  
  // Admin specific
  const [adminPostType, setAdminPostType] = useState<PostType>(PostType.EVENT_ANNOUNCEMENT);

  // Teacher specific
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentsInSelectedClass, setStudentsInSelectedClass] = useState<Student[]>([]);
  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC_CLASS' | 'SPECIFIC_RECIPIENTS'>('PUBLIC_CLASS');
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) { // Reset form when modal closes
      setTitle('');
      setDescription('');
      setEventDate('');
      setAdminPostType(PostType.EVENT_ANNOUNCEMENT);
      setSelectedClassId('');
      setStudentsInSelectedClass([]);
      setPrivacyLevel('PUBLIC_CLASS');
      setTargetStudentIds([]);
      setError(null);
      return;
    }

    if (currentUser?.role === UserRole.TEACHER && currentUser.id) {
      setIsLoading(true);
      fetchClassesByTeacherId(currentUser.id)
        .then(classes => {
          setTeacherClasses(classes);
          if (classes.length > 0) {
            setSelectedClassId(classes[0].id); // Default to first class
          }
        })
        .catch(err => setError("Failed to load classes."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (currentUser?.role === UserRole.TEACHER && selectedClassId) {
      setIsLoading(true);
      fetchStudentsByClassId(selectedClassId)
        .then(setStudentsInSelectedClass)
        .catch(err => setError("Failed to load students for class."))
        .finally(() => setIsLoading(false));
      setTargetStudentIds([]); // Reset targets when class changes
    } else {
      setStudentsInSelectedClass([]);
    }
  }, [selectedClassId, currentUser?.role]);

  const studentOptionsForSelect: OptionType[] = useMemo(() => 
    studentsInSelectedClass.map(s => ({ value: s.id, label: s.name })),
    [studentsInSelectedClass]
  );
  
  const handleTargetStudentChange = (selectedOptions: any) => {
    setTargetStudentIds(selectedOptions ? selectedOptions.map((opt: OptionType) => opt.value) : []);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("User not identified.");
      return;
    }
    if (!title.trim() || !description.trim() || !eventDate) {
      setError("Title, description, and event date are required.");
      return;
    }

    let postData: any = {
      authorId: currentUser.id,
      title,
      content: description,
      isCalendarEvent: true,
      eventDate: new Date(eventDate).toISOString(),
    };

    if (currentUser.role === UserRole.ADMIN) {
      postData.type = adminPostType;
    } else if (currentUser.role === UserRole.TEACHER) {
      if (!selectedClassId) {
        setError("Please select a target class.");
        return;
      }
      postData.type = PostType.CLASS_UPDATE; // Teacher events are class updates
      postData.targetClassId = selectedClassId;
      postData.privacyLevel = privacyLevel;
      if (privacyLevel === 'SPECIFIC_RECIPIENTS') {
        if (targetStudentIds.length === 0) {
          setError("Please select at least one student for a specific recipients event.");
          return;
        }
        postData.targetStudentIdsForPost = targetStudentIds;
      }
    } else {
      setError("Invalid user role for creating events.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createPost(postData, currentUser);
      onEventCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create event:", err);
      setError(err instanceof Error ? err.message : "Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = currentUser?.role === UserRole.ADMIN ? "Create School-Wide Event" : "Create Class Event/Reminder";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          id="eventTitle" 
          label="Event Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          disabled={isLoading}
        />
        <div>
          <label htmlFor="eventDescription" className="block text-sm font-medium text-neutral-dark mb-1">Description</label>
          <textarea
            id="eventDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
            disabled={isLoading}
          />
        </div>
        <Input 
          id="eventDate" 
          label="Event Date" 
          type="date" 
          value={eventDate} 
          onChange={(e) => setEventDate(e.target.value)} 
          required 
          disabled={isLoading}
        />

        {/* Admin Specific Fields */}
        {currentUser?.role === UserRole.ADMIN && (
          <div>
            <label htmlFor="adminPostType" className="block text-sm font-medium text-neutral-dark mb-1">Event Type</label>
            <select
              id="adminPostType"
              value={adminPostType}
              onChange={(e) => setAdminPostType(e.target.value as PostType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              disabled={isLoading}
            >
              <option value={PostType.EVENT_ANNOUNCEMENT}>School Event</option>
              <option value={PostType.ACADEMIC_ANNOUNCEMENT}>Academic Date/Milestone</option>
            </select>
          </div>
        )}

        {/* Teacher Specific Fields */}
        {currentUser?.role === UserRole.TEACHER && (
          <>
            {teacherClasses.length > 0 && (
              <div>
                <label htmlFor="targetClass" className="block text-sm font-medium text-neutral-dark mb-1">Target Class</label>
                <select
                  id="targetClass"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  disabled={isLoading || teacherClasses.length === 0}
                >
                  {teacherClasses.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="privacyLevel" className="block text-sm font-medium text-neutral-dark mb-1">Privacy Level</label>
              <select
                id="privacyLevel"
                value={privacyLevel}
                onChange={(e) => {
                    setPrivacyLevel(e.target.value as 'PUBLIC_CLASS' | 'SPECIFIC_RECIPIENTS');
                    if (e.target.value === 'PUBLIC_CLASS') setTargetStudentIds([]);
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                disabled={isLoading}
              >
                <option value="PUBLIC_CLASS">Public to Entire Class</option>
                <option value="SPECIFIC_RECIPIENTS">Specific Students in Class</option>
              </select>
            </div>
            {privacyLevel === 'SPECIFIC_RECIPIENTS' && (
              <div>
                <label htmlFor="targetStudents" className="block text-sm font-medium text-neutral-dark mb-1">Target Students</label>
                <Select
                    isMulti
                    id="targetStudents"
                    name="targetStudents"
                    options={studentOptionsForSelect}
                    value={studentOptionsForSelect.filter(opt => targetStudentIds.includes(opt.value))}
                    onChange={handleTargetStudentChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select students..."
                    isDisabled={isLoading || studentsInSelectedClass.length === 0}
                />
                {studentsInSelectedClass.length === 0 && selectedClassId && <p className="text-xs text-gray-500 mt-1">No students in selected class to target.</p>}
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-danger text-center bg-red-50 p-2 rounded-md">{error}</p>}
        
        <div className="pt-3 flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEventModal;
