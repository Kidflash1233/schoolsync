
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
    fetchStudentById, 
    fetchPostsByClassId, 
    fetchClassById, 
    fetchUserById,
    createParentTeacherReminder,
    fetchParentTeacherRemindersByParentAndStudentId
} from '../../services/apiService';
import { Student, Post, Class, User, NavItemConfig, ParentTeacherReminder, SolidCalendarIcon as ChildCalendarIcon, ClipboardDocumentCheckIcon as ReminderIcon } from '../../types';
import FeedCard from '../Feeds/FeedCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import Card from '../UI/Card';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { ChatBubbleLeftRightIcon, NewspaperIcon, PresentationChartLineIcon, DocumentCheckIcon, CalendarDaysIcon, BellIcon } from '@heroicons/react/24/outline'; // Updated icons
import { DEFAULT_AVATAR_PLACEHOLDER } from '../../constants';
import { format, parseISO } from 'date-fns';

const StudentFeedTab: React.FC<{ posts: Post[], studentName: string }> = ({ posts, studentName }) => (
  <div>
    <h2 className="text-xl font-semibold text-textDisplay mb-3">Class Feed for {studentName}</h2>
    {posts.length > 0 ? (
      posts.map(post => (
        <div key={post.id} className="relative">
            <FeedCard post={post} />
            {post.isCalendarEvent && post.eventDate && (
                 <div className="absolute top-2 right-2 bg-primary/80 text-textOnPrimary text-xs px-2 py-0.5 rounded-md flex items-center shadow-sm">
                    <CalendarDaysIcon className="h-3.5 w-3.5 mr-1"/> Event: {format(parseISO(post.eventDate), 'MMM d')}
                 </div>
            )}
        </div>
      ))
    ) : (
      <Card><p className="text-textSubtle text-center py-6">No posts yet for {studentName}'s class.</p></Card>
    )}
  </div>
);

const ChildClassEventsTab: React.FC<{ posts: Post[], studentName: string }> = ({ posts, studentName }) => {
    const calendarEvents = posts.filter(p => p.isCalendarEvent && p.eventDate).sort((a,b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());
    return (
        <Card title={`Class Calendar Events for ${studentName}`}>
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
                 <p className="text-textSubtle text-center py-6">No specific calendar events found for {studentName}'s class.</p>
            )}
        </Card>
    );
};

const PrivateRemindersTab: React.FC<{ student: Student, teacherId: string, parentId: string }> = ({ student, teacherId, parentId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [reminders, setReminders] = useState<ParentTeacherReminder[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingReminders, setIsLoadingReminders] = useState(true);
    const [error, setError] = useState('');

    const loadReminders = () => {
        setIsLoadingReminders(true);
        fetchParentTeacherRemindersByParentAndStudentId(parentId, student.id)
            .then(setReminders)
            .catch(console.error)
            .finally(() => setIsLoadingReminders(false));
    };

    useEffect(() => {
        loadReminders();
    }, [parentId, student.id]);

    const handleSubmitReminder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId) {
            setError("Cannot send reminder: No teacher is assigned to this student's class or the teacher ID is missing.");
            return;
        }
        if (!title.trim() || !description.trim() || !eventDate) {
            setError("All fields are required for the reminder.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await createParentTeacherReminder({
                parentId,
                teacherId,
                studentId: student.id,
                title,
                description,
                eventDate: new Date(eventDate).toISOString(),
            });
            setTitle('');
            setDescription('');
            setEventDate('');
            loadReminders();
        } catch (err) {
            console.error(err);
            setError("Failed to send reminder.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <Card title={`Send Private Reminder to ${student.name}'s Teacher`}>
                {!teacherId && <p className="text-center text-sm text-warning-textDark bg-warning-bgLight p-3 rounded-md border border-warning-borderLight">This student's class does not currently have a teacher assigned to receive reminders. Please contact administration.</p>}
                <form onSubmit={handleSubmitReminder} className="space-y-3 mt-3">
                    <Input label="Reminder Title" value={title} onChange={e => setTitle(e.target.value)} required disabled={!teacherId || isSubmitting} />
                    <Input label="Event Date for Reminder" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required disabled={!teacherId || isSubmitting} />
                    <div>
                        <label htmlFor="reminderDescription" className="block text-sm font-medium text-textBody mb-1">Details</label>
                        <textarea id="reminderDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} required className="mt-1 block w-full px-3 py-2 border border-borderDefault rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-textBody placeholder-textSubtle bg-bgSurface" disabled={!teacherId || isSubmitting} />
                    </div>
                    {error && <p className="text-sm text-danger-textDark bg-danger-bgLight p-2 rounded-md border border-danger-borderLight">{error}</p>}
                    <Button type="submit" isLoading={isSubmitting} fullWidth disabled={!teacherId || isSubmitting}>Send Reminder</Button>
                </form>
            </Card>

            <Card title="Sent Reminders">
                {isLoadingReminders ? <LoadingSpinner /> : reminders.length > 0 ? (
                    <ul className="space-y-2.5">
                        {reminders.map(r => (
                            <li key={r.id} className={`p-2.5 border rounded-md ${r.acknowledged ? 'bg-success-bgLight border-success-borderLight' : 'bg-warning-bgLight border-warning-borderLight'}`}>
                                <h4 className="font-semibold text-sm text-textBody">{r.title} - {format(parseISO(r.eventDate), 'MMM d, yyyy')}</h4>
                                <p className="text-xs text-textSubtle">{r.description}</p>
                                <p className={`text-xs mt-1 font-medium ${r.acknowledged ? 'text-success-textDark' : 'text-warning-textDark'}`}>
                                    Status: {r.acknowledged ? 'Acknowledged by teacher' : 'Pending acknowledgement'}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-textSubtle text-center py-4">You haven't sent any private reminders for {student.name} yet.</p>
                )}
            </Card>
        </div>
    );
};

const AttendanceTabPlaceholder: React.FC<{ studentName: string }> = ({ studentName }) => ( 
    <Card title={`Attendance for ${studentName}`}>
        <DocumentCheckIcon className="h-10 w-10 text-textSubtle mx-auto mb-3"/>
        <p className="text-textSubtle text-center py-6">Attendance records feature coming soon!</p>
    </Card>
);

const GradesReportsTabPlaceholder: React.FC<{ studentName: string }> = ({ studentName }) => ( 
    <Card title={`Grades & Reports for ${studentName}`}>
        <PresentationChartLineIcon className="h-10 w-10 text-textSubtle mx-auto mb-3"/>
        <p className="text-textSubtle text-center py-6">Grades and reports feature coming soon!</p>
    </Card>
);


const ParentStudentView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryTeacherIdForReminders, setPrimaryTeacherIdForReminders] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!studentId || !currentUser) return;
      setIsLoading(true);
      try {
        const fetchedStudent = await fetchStudentById(studentId);
        if (!fetchedStudent || !fetchedStudent.parentIds?.includes(currentUser.id)) {
          setStudent(null); 
          setIsLoading(false);
          return;
        }
        setStudent(fetchedStudent);

        const fetchedClass = await fetchClassById(fetchedStudent.classId);
        setStudentClass(fetchedClass || null);
        
        let fetchedTeacher: User | null = null;
        if (fetchedClass && fetchedClass.teacherIds && fetchedClass.teacherIds.length > 0) {
          fetchedTeacher = await fetchUserById(fetchedClass.teacherIds[0]);
          setPrimaryTeacherIdForReminders(fetchedClass.teacherIds[0]);
        } else {
            setPrimaryTeacherIdForReminders('');
        }
        setTeacher(fetchedTeacher || null);

        if (fetchedClass) {
          const fetchedPosts = await fetchPostsByClassId(fetchedClass.id, currentUser);
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error("Failed to load student data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [studentId, currentUser]);

  const tabs: NavItemConfig[] = useMemo(() => [
    { to: `feed`, label: 'Feed', icon: NewspaperIcon },
    { to: `class-events`, label: "Class Events", icon: CalendarDaysIcon},
    { to: `private-reminders`, label: 'Reminders', icon: BellIcon },
    { to: `attendance`, label: 'Attendance', icon: DocumentCheckIcon },
    { to: `grades-reports`, label: 'Grades/Reports', icon: PresentationChartLineIcon },
  ], []);

  const currentTabFromPath = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return tabs.find(t => t.to === lastSegment)?.to || 'feed';
  }, [location.pathname, tabs]);


  if (isLoading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!student) return <Card><p className="text-center text-danger p-6">Student data not found or access denied.</p></Card>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center space-x-2.5 mb-3 sm:mb-0">
            <Avatar src={student.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER} alt={student.name} size="md"/> {/* md avatar */}
            <h1 className="text-xl font-semibold text-textDisplay">Updates for {student.name}</h1>
        </div>
        {teacher && (
            <Link to="/messages" state={{ preselectUserId: teacher.id }} className="w-full sm:w-auto">
                <Button variant="secondary" size="sm" fullWidth className="sm:w-auto">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1.5 inline"/> Message Teacher
                </Button>
            </Link>
        )}
      </div>
      
      {studentClass && teacher && (
        <Card className="mb-4 bg-bgMuted">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3">
                <Avatar src={teacher.avatarUrl} alt={teacher.name} size="sm"/>
                <div>
                    <p className="text-md font-semibold text-textBody">Class: {studentClass.name}</p>
                    <p className="text-xs text-textSubtle">Teacher: {teacher.name} <span className="hidden sm:inline">({teacher.email})</span></p>
                </div>
            </div>
        </Card>
      )}
       {studentClass && !teacher && (
        <Card className="mb-4 bg-warning-bgLight border-warning-borderLight">
            <div className="p-3">
                 <p className="text-md font-semibold text-textBody">Class: {studentClass.name}</p>
                 <p className="text-sm text-warning-textDark">No primary teacher is currently assigned to this class for direct messaging or reminders.</p>
            </div>
        </Card>
      )}

      <nav className="flex space-x-1 border-b border-borderLight pb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={`/child/${studentId}/${tab.to}`}
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

      <div className="mt-4">
        <Routes>
          <Route path="feed" element={<StudentFeedTab posts={posts} studentName={student.name}/>} />
          <Route path="class-events" element={<ChildClassEventsTab posts={posts} studentName={student.name} />} />
          <Route path="private-reminders" element={<PrivateRemindersTab student={student} teacherId={primaryTeacherIdForReminders} parentId={currentUser!.id} />} />
          <Route path="attendance" element={<AttendanceTabPlaceholder studentName={student.name}/>} />
          <Route path="grades-reports" element={<GradesReportsTabPlaceholder studentName={student.name}/>} />
          <Route index element={<Navigate to="feed" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default ParentStudentView;
