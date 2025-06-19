
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
    fetchClassById, 
    fetchPostsByClassId, 
    fetchStudentsByClassId,
    fetchParentTeacherRemindersByTeacherId,
    acknowledgeParentTeacherReminder
} from '../../services/apiService';
import { Class, Post, Student, NavItemConfig, ParentTeacherReminder, BellAlertIcon, SolidCalendarIcon as ClassCalendarIcon } from '../../types';
import FeedCard from '../Feeds/FeedCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Avatar from '../UI/Avatar';
import { PlusCircleIcon, UserGroupIcon, NewspaperIcon, AcademicCapIcon, ClipboardDocumentListIcon, CheckCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'; // Updated Calendar icon
import { DEFAULT_AVATAR_PLACEHOLDER } from '../../constants';
import { format, parseISO } from 'date-fns';


const ClassFeedTab: React.FC<{ posts: Post[], classId: string }> = ({ posts, classId }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-textDisplay">Recent Posts</h2>
        <Link to={`/class/${classId}/create-post`}>
            <Button variant="primary" size="sm">
                <PlusCircleIcon className="h-4 w-4 mr-1.5 inline"/> New Post
            </Button>
        </Link>
    </div>
    {posts.length > 0 ? (
      posts.map(post => <FeedCard key={post.id} post={post} />)
    ) : (
      <Card><p className="text-textSubtle text-center py-6">No posts yet for this class. Create one!</p></Card>
    )}
  </div>
);

const StudentRosterTab: React.FC<{ students: Student[] }> = ({ students }) => (
  <Card title="Students Enrolled">
    {/* <UserGroupIcon className="h-8 w-8 text-secondary mx-auto mb-4" /> // Icon removed for cleaner card title area */}
    {students.length > 0 ? (
      <ul className="divide-y divide-borderLight">
        {students.map(student => (
          <li key={student.id} className="py-2.5 flex items-center space-x-3">
            <Avatar src={student.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER} alt={student.name} size="sm" />
            <span className="text-sm font-medium text-textBody">{student.name}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-textSubtle text-center py-4">No students enrolled in this class yet.</p>
    )}
  </Card>
);

const ClassCalendarEventsTab: React.FC<{ posts: Post[], classId: string }> = ({ posts, classId }) => {
    const calendarEvents = posts.filter(p => p.isCalendarEvent && p.eventDate).sort((a,b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());
    return (
        <Card title="Class Calendar Events">
             {calendarEvents.length > 0 ? (
                <ul className="space-y-3">
                    {calendarEvents.map(eventPost => (
                        <li key={eventPost.id} className="p-3 border border-borderLight rounded-md shadow-xs bg-bgMuted">
                            <h3 className="text-md font-semibold text-primary">{eventPost.title}</h3>
                            <p className="text-xs text-textSubtle mb-1">Date: {format(parseISO(eventPost.eventDate!), 'EEEE, MMMM d, yyyy')}</p>
                            <p className="text-sm text-textBody whitespace-pre-line">{eventPost.content}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-textSubtle text-center py-6">No calendar events posted for this class yet.</p>
            )}
        </Card>
    );
};

const ParentRemindersTab: React.FC<{ teacherId: string }> = ({ teacherId }) => {
    const [reminders, setReminders] = useState<ParentTeacherReminder[]>([]);
    const [isLoadingReminders, setIsLoadingReminders] = useState(true);

    const loadReminders = () => {
        if (!teacherId) {
            setReminders([]);
            setIsLoadingReminders(false);
            return;
        }
        setIsLoadingReminders(true);
        fetchParentTeacherRemindersByTeacherId(teacherId)
            .then(setReminders)
            .catch(console.error)
            .finally(() => setIsLoadingReminders(false));
    };
    
    useEffect(() => {
        loadReminders();
    }, [teacherId]);

    const handleAcknowledge = async (reminderId: string) => {
        await acknowledgeParentTeacherReminder(reminderId);
        loadReminders(); 
    };

    if (isLoadingReminders) return <LoadingSpinner />;
    if (!teacherId && !isLoadingReminders) {
        return (
            <Card title="Private Reminders from Parents">
                <p className="text-textSubtle text-center py-6">This class does not have a primary teacher assigned for reminders.</p>
            </Card>
        );
    }

    return (
        <Card title="Private Reminders from Parents">
            {reminders.length > 0 ? (
                <ul className="space-y-3">
                    {reminders.map(reminder => (
                        <li key={reminder.id} className={`p-3 border rounded-md shadow-xs ${reminder.acknowledged ? 'bg-success-bgLight border-success-borderLight' : 'bg-warning-bgLight border-warning-borderLight'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-md font-semibold text-textDisplay">{reminder.title} (for {reminder.studentName})</h3>
                                    <p className="text-xs text-textSubtle mb-1">Event Date: {format(parseISO(reminder.eventDate), 'EEEE, MMMM d, yyyy')}</p>
                                    <p className="text-sm text-textBody whitespace-pre-line">{reminder.description}</p>
                                    <p className="text-xs text-textSubtle mt-1.5">Submitted: {format(parseISO(reminder.createdAt), 'MMM d, p')}</p>
                                </div>
                                {!reminder.acknowledged ? (
                                    <Button onClick={() => handleAcknowledge(reminder.id)} size="sm" variant="success" className="!py-1 !px-2 text-xs">
                                        <CheckCircleIcon className="h-3.5 w-3.5 mr-1 inline"/> Ack
                                    </Button>
                                ) : (
                                    <span className="text-xs text-success-textDark font-medium flex items-center bg-success-bgLight px-2 py-1 rounded-full">
                                        <CheckCircleIcon className="h-4 w-4 mr-1"/> Acknowledged
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-textSubtle text-center py-6">No private reminders from parents at this time.</p>
            )}
        </Card>
    );
};


const AssignmentsTabPlaceholder: React.FC = () => (
    <Card title="Assignments">
        <ClipboardDocumentListIcon className="h-10 w-10 text-textSubtle mx-auto mb-3"/>
        <p className="text-textSubtle text-center py-6">Assignments management feature coming soon!</p>
    </Card>
);

const GradesTabPlaceholder: React.FC = () => (
    <Card title="Grades">
        <AcademicCapIcon className="h-10 w-10 text-textSubtle mx-auto mb-3"/>
        <p className="text-textSubtle text-center py-6">Grades management feature coming soon!</p>
    </Card>
);


const TeacherClassView: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();

  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      setIsLoading(true);
      Promise.all([
        fetchClassById(classId),
        fetchPostsByClassId(classId),
        fetchStudentsByClassId(classId)
      ]).then(([classData, postData, studentData]) => {
        setCurrentClass(classData || null);
        setPosts(postData);
        setStudents(studentData);
      }).catch(console.error)
      .finally(() => setIsLoading(false));
    }
  }, [classId]);
  
  const tabs: NavItemConfig[] = useMemo(() => [
    { to: `feed`, label: 'Feed', icon: NewspaperIcon },
    { to: `roster`, label: 'Roster', icon: UserGroupIcon },
    { to: `class-calendar`, label: 'Calendar', icon: CalendarDaysIcon }, // Changed icon
    { to: `parent-reminders`, label: 'Reminders', icon: BellAlertIcon },
    { to: `assignments`, label: 'Assignments', icon: ClipboardDocumentListIcon },
    { to: `grades`, label: 'Grades', icon: AcademicCapIcon },
  ], []);

  const currentTabFromPath = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return tabs.find(t => t.to === lastSegment)?.to || 'feed';
  }, [location.pathname, tabs]);


  if (isLoading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!currentClass) return <p className="text-center text-danger p-6">Class not found.</p>;
  
  const primaryTeacherId = currentClass.teacherIds && currentClass.teacherIds.length > 0 ? currentClass.teacherIds[0] : '';

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-textDisplay">{currentClass.name}</h1>
      
      <nav className="flex space-x-1 border-b border-borderLight pb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={`/class/${classId}/${tab.to}`}
            className={({ isActive }) =>
              `group inline-flex items-center py-2 px-3 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors duration-150 ease-in-out border-b-2
              ${isActive 
                ? 'border-primary text-primary' 
                : 'border-transparent text-textSubtle hover:text-textBody hover:border-borderDefault'}`
            }
            aria-current={tab.to === currentTabFromPath ? 'page' : undefined}
          >
            {tab.icon && <tab.icon className="-ml-0.5 mr-1.5 h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4"> {/* Added margin top for content after tabs */}
        <Routes>
          <Route path="feed" element={<ClassFeedTab posts={posts} classId={classId!} />} />
          <Route path="roster" element={<StudentRosterTab students={students} />} />
          <Route path="class-calendar" element={<ClassCalendarEventsTab posts={posts} classId={classId!} />} />
          <Route path="parent-reminders" element={<ParentRemindersTab teacherId={primaryTeacherId}/>} />
          <Route path="assignments" element={<AssignmentsTabPlaceholder />} />
          <Route path="grades" element={<GradesTabPlaceholder />} />
          <Route index element={<Navigate to="feed" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default TeacherClassView;
