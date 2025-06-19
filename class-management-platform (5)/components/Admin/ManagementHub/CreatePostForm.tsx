
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth'; // Corrected path
import { createPost, fetchClassesByTeacherId, fetchStudentsByClassId, fetchAllClasses, MASTER_CLASS_ID } from '../../../services/apiService'; // Corrected path
import { PostType, UserRole, Class, Student } from '../../../types'; // Corrected path
import Button from '../../UI/Button'; // Corrected path
import Input from '../../UI/Input'; // Corrected path
import Card from '../../UI/Card'; // Corrected path
import Select from 'react-select'; // Using react-select for multi-select

interface OptionType {
  value: string;
  label: string;
}

const CreatePostForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { classId: routeClassId } = useParams<{ classId?: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(routeClassId);
  const [postType, setPostType] = useState<PostType>(PostType.CLASS_UPDATE);
  
  const [isCalendarEvent, setIsCalendarEvent] = useState(false);
  const [eventDate, setEventDate] = useState('');

  // New states for privacy and targeting (Phase 1 Calendar)
  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC_CLASS' | 'SPECIFIC_RECIPIENTS'>('PUBLIC_CLASS');
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);
  
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]); // For Teacher's own classes
  const [allSchoolClasses, setAllSchoolClasses] = useState<Class[]>([]); // For Admin selection, including "All School"
  const [studentsInSelectedClass, setStudentsInSelectedClass] = useState<Student[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role === UserRole.TEACHER && currentUser.id) {
        fetchClassesByTeacherId(currentUser.id).then(classes => {
            setTeacherClasses(classes);
            if (routeClassId) {
                setSelectedClassId(routeClassId);
            } else if (classes.length > 0) {
                setSelectedClassId(classes[0].id);
            }
            setPostType(PostType.CLASS_UPDATE); 
        });
    } else if (currentUser?.role === UserRole.ADMIN) {
        setPostType(PostType.ACADEMIC_ANNOUNCEMENT); 
        fetchAllClasses().then(classes => {
            setAllSchoolClasses(classes);
             // If admin wants to make a CLASS_UPDATE, default to MASTER_CLASS_ID if available
            if (classes.find(c => c.id === MASTER_CLASS_ID)) {
                setSelectedClassId(MASTER_CLASS_ID);
            }
        });
    }
  }, [currentUser, routeClassId]);

  // Fetch students when selectedClassId changes (for teacher posts or Admin CLASS_UPDATE to non-master class)
  useEffect(() => {
    if (selectedClassId && selectedClassId !== MASTER_CLASS_ID && (currentUser?.role === UserRole.TEACHER || (currentUser?.role === UserRole.ADMIN && postType === PostType.CLASS_UPDATE) )) {
      fetchStudentsByClassId(selectedClassId).then(setStudentsInSelectedClass);
    } else {
      setStudentsInSelectedClass([]); // No students to target for MASTER_CLASS_ID or non-class_update admin posts
    }
    setTargetStudentIds([]); // Reset targets when class or post type changes
  }, [selectedClassId, currentUser?.role, postType]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    if (isCalendarEvent && !eventDate) {
        setError('Event date is required for a calendar event post.');
        return;
    }

    if (currentUser.role === UserRole.TEACHER || (currentUser.role === UserRole.ADMIN && postType === PostType.CLASS_UPDATE)) {
        if (!selectedClassId) {
            setError('Please select a class.');
            return;
        }
        if (isCalendarEvent && privacyLevel === 'SPECIFIC_RECIPIENTS' && targetStudentIds.length === 0 && selectedClassId !== MASTER_CLASS_ID) {
            setError('Please select at least one student for a specific recipients calendar event (unless targeting All School).');
            return;
        }
    }


    setIsLoading(true);
    setError('');

    try {
      const newPostData: any = { 
        authorId: currentUser.id,
        title,
        content,
        type: postType,
        isCalendarEvent: isCalendarEvent,
      };
      if (mediaUrl.trim()) {
        newPostData.mediaUrl = mediaUrl;
        newPostData.mediaType = 'image'; // Assuming image for now
      }
      if (isCalendarEvent) {
          newPostData.eventDate = new Date(eventDate).toISOString();
      }


      if (currentUser.role === UserRole.TEACHER) {
        newPostData.targetClassId = selectedClassId;
        if (isCalendarEvent) { // Calendar specific fields for teacher
          newPostData.privacyLevel = privacyLevel;
          if (privacyLevel === 'SPECIFIC_RECIPIENTS') {
            newPostData.targetStudentIdsForPost = targetStudentIds;
          }
        }
      } else if (currentUser.role === UserRole.ADMIN) {
        if (postType === PostType.CLASS_UPDATE) {
            newPostData.targetClassId = selectedClassId; // Admin selected a class for CLASS_UPDATE
            if (isCalendarEvent && selectedClassId !== MASTER_CLASS_ID) { // Privacy only for non-master class targets by Admin
                newPostData.privacyLevel = privacyLevel;
                 if (privacyLevel === 'SPECIFIC_RECIPIENTS') {
                    newPostData.targetStudentIdsForPost = targetStudentIds;
                }
            } else if (isCalendarEvent && selectedClassId === MASTER_CLASS_ID) {
                newPostData.privacyLevel = 'PUBLIC_CLASS'; // Events for All School are public
            }
        }
        // For ACADEMIC_ANNOUNCEMENT or EVENT_ANNOUNCEMENT, targetClassId will be set to MASTER_CLASS_ID in apiService.
      }

      await createPost(newPostData, currentUser);
      setIsLoading(false);
      
      if (currentUser.role === UserRole.TEACHER && selectedClassId) {
        navigate(`/class/${selectedClassId}/feed`); 
      } else if (currentUser.role === UserRole.ADMIN && (postType === PostType.ACADEMIC_ANNOUNCEMENT || postType === PostType.EVENT_ANNOUNCEMENT || selectedClassId === MASTER_CLASS_ID) ){
         navigate('/global-feeds'); 
      } else if (currentUser.role === UserRole.ADMIN && postType === PostType.CLASS_UPDATE && selectedClassId) {
         navigate(`/class/${selectedClassId}/feed`); // If admin posted to a specific class
      }
       else {
        navigate('/'); 
      }
    } catch (err) {
      setError('Failed to create post. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (!currentUser) return <p>You must be logged in to create a post.</p>;

  const getFormTitle = () => {
    if(currentUser.role === UserRole.ADMIN) return "Create School Announcement/Post";
    if(routeClassId) return `New Post for ${teacherClasses.find(c => c.id === routeClassId)?.name || 'Class'}`;
    return "Create New Post";
  }

  const studentOptionsForSelect: OptionType[] = useMemo(() => 
    studentsInSelectedClass.map(s => ({ value: s.id, label: s.name })),
    [studentsInSelectedClass]
  );
  
  const handleTargetStudentChange = (selectedOptions: any) => {
    setTargetStudentIds(selectedOptions ? selectedOptions.map((opt: OptionType) => opt.value) : []);
  };
  
  const currentTargetClassIsMaster = selectedClassId === MASTER_CLASS_ID;

  return (
    <Card title={getFormTitle()}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-neutral-dark mb-1">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>

        <Input id="mediaUrl" label="Media URL (Optional Image)" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />

        {/* Post Type and Class Selection for Admin */}
        {currentUser.role === UserRole.ADMIN && (
             <>
                <div>
                    <label htmlFor="postTypeAdmin" className="block text-sm font-medium text-neutral-dark mb-1">Post Type</label>
                    <select
                        id="postTypeAdmin"
                        value={postType}
                        onChange={(e) => {
                            const newType = e.target.value as PostType;
                            setPostType(newType);
                            if (newType === PostType.CLASS_UPDATE && allSchoolClasses.find(c => c.id === MASTER_CLASS_ID)) {
                                setSelectedClassId(MASTER_CLASS_ID); // Default to All School for class updates
                            } else {
                                setSelectedClassId(undefined); // Clear class selection for global types
                            }
                        }}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                        <option value={PostType.CLASS_UPDATE}>Class Update (e.g., for All School)</option>
                        <option value={PostType.ACADEMIC_ANNOUNCEMENT}>Global Academic Announcement</option>
                        <option value={PostType.EVENT_ANNOUNCEMENT}>Global Event Announcement</option>
                    </select>
                </div>
                {postType === PostType.CLASS_UPDATE && (
                    <div>
                        <label htmlFor="classSelectAdmin" className="block text-sm font-medium text-neutral-dark mb-1">Target Class</label>
                        <select
                            id="classSelectAdmin"
                            value={selectedClassId || ''}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                        {allSchoolClasses.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                        </select>
                    </div>
                )}
            </>
        )}

        {/* Class Selection for Teacher */}
        {currentUser.role === UserRole.TEACHER && !routeClassId && teacherClasses.length > 0 && (
            <div>
                <label htmlFor="classSelectTeacher" className="block text-sm font-medium text-neutral-dark mb-1">Select Class</label>
                <select
                    id="classSelectTeacher"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                    {teacherClasses.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
            </div>
        )}

        {/* Calendar Event Fields */}
        <div className="flex items-center space-x-2 pt-2">
            <input
                type="checkbox"
                id="isCalendarEvent"
                checked={isCalendarEvent}
                onChange={(e) => setIsCalendarEvent(e.target.checked)}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isCalendarEvent" className="text-sm font-medium text-neutral-dark">
                Add this as a calendar event/reminder?
            </label>
        </div>

        {isCalendarEvent && (
            <Input
                id="eventDate"
                label="Event/Reminder Date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
            />
        )}
        
        {/* Privacy fields for Teacher posts OR Admin CLASS_UPDATE to non-master class */}
        {isCalendarEvent && !currentTargetClassIsMaster && (currentUser.role === UserRole.TEACHER || (currentUser.role === UserRole.ADMIN && postType === PostType.CLASS_UPDATE)) && (
            <>
                <div>
                    <label htmlFor="privacyLevel" className="block text-sm font-medium text-neutral-dark mb-1">Privacy Level for Calendar Event</label>
                    <select
                    id="privacyLevel"
                    value={privacyLevel}
                    onChange={(e) => {
                        setPrivacyLevel(e.target.value as 'PUBLIC_CLASS' | 'SPECIFIC_RECIPIENTS');
                        if (e.target.value === 'PUBLIC_CLASS') setTargetStudentIds([]);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                    <option value="PUBLIC_CLASS">Public to Entire Class</option>
                    <option value="SPECIFIC_RECIPIENTS">Specific Students in Class</option>
                    </select>
                </div>
                {privacyLevel === 'SPECIFIC_RECIPIENTS' && (
                    <div>
                    <label htmlFor="targetStudents" className="block text-sm font-medium text-neutral-dark mb-1">Target Students for Calendar Event</label>
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
                        isDisabled={studentsInSelectedClass.length === 0}
                    />
                    {studentsInSelectedClass.length === 0 && selectedClassId && <p className="text-xs text-gray-500 mt-1">No students in selected class to target.</p>}
                    </div>
                )}
            </>
        )}


        {error && <p className="text-sm text-danger">{error}</p>}
        
        <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isLoading}>
                Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                {isLoading ? 'Posting...' : 'Create Post'}
            </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePostForm;
