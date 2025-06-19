
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
    fetchStudentsByParentId, 
    fetchPostsByClassId, 
    fetchClassById, 
    fetchUserById, 
    fetchGlobalPosts, 
    fetchCalendarItemsForUser
} from '../../services/apiService';
import { Student, Post, Class, User, CalendarDisplayItem } from '../../types';
import FeedCard from '../Feeds/FeedCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import Card from '../UI/Card';
import Avatar from '../UI/Avatar';
import UpcomingEventsCard from '../Dashboard/UpcomingEventsCard';
import { AcademicCapIcon, UserIcon, CalendarDaysIcon, IdentificationIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { DEFAULT_AVATAR_PLACEHOLDER } from '../../constants';

interface ChildFeedData {
  student: Student;
  className: string;
  teacherName: string;
  posts: Post[];
}

interface ParentMetrics {
  childrenCount: number;
}

const ParentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [childrenFeeds, setChildrenFeeds] = useState<ChildFeedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalAnnouncements, setGlobalAnnouncements] = useState<Post[]>([]);
  const [upcomingPersonalizedEvents, setUpcomingPersonalizedEvents] = useState<CalendarDisplayItem[]>([]);
  const [metrics, setMetrics] = useState<ParentMetrics | null>(null);


  useEffect(() => {
    const loadData = async () => {
      if (!currentUser || !currentUser.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const studentPromises = currentUser.childStudentIds 
            ? fetchStudentsByParentId(currentUser.id) 
            : Promise.resolve([]);
        
        const [students, announcements, calendarItemsResponse] = await Promise.all([
            studentPromises,
            fetchGlobalPosts(),
            fetchCalendarItemsForUser(currentUser.id, currentUser.role, currentUser.childStudentIds)
        ]);
        
        setGlobalAnnouncements(announcements);
        
        const futureEvents = calendarItemsResponse
            .filter(event => new Date(event.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
        setUpcomingPersonalizedEvents(futureEvents);

        const feedsData: ChildFeedData[] = [];
        if (students && students.length > 0) {
            setMetrics({ childrenCount: students.length });
            for (const student of students) {
              const classInfo = await fetchClassById(student.classId);
              let teacherName = 'N/A';
              if (classInfo && classInfo.teacherIds && classInfo.teacherIds.length > 0) {
                const teacher = await fetchUserById(classInfo.teacherIds[0]);
                teacherName = teacher?.name || 'N/A';
              }
              const posts = await fetchPostsByClassId(student.classId, currentUser); 
              feedsData.push({
                student,
                className: classInfo?.name || 'Unknown Class',
                teacherName,
                posts,
              });
            }
        } else {
            setMetrics({ childrenCount: 0 });
        }
        setChildrenFeeds(feedsData);
      } catch (error) {
        console.error("Failed to load parent dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  if (isLoading && !metrics && childrenFeeds.length === 0) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

  const allPostsForFeed = childrenFeeds
    .flatMap(feed => 
        feed.posts.map(post => ({ ...post, studentName: feed.student.name, studentId: feed.student.id, className: feed.className, isGlobal: false }))
    )
    .concat(globalAnnouncements.map(post => ({...post, studentName: "School Announcement", studentId: "global", className: "General", isGlobal: true})))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, iconColorClass?: string }> = ({ icon: Icon, title, value, iconColorClass = 'text-primary' }) => (
    <Card className="shadow-sm flex-1 rounded-md text-center">
        <div className="p-3">
            <Icon className={`h-7 w-7 ${iconColorClass} mx-auto mb-1.5`} />
            <p className="text-xl font-semibold text-textDisplay">{value}</p>
            <p className="text-xs text-textSubtle mt-0.5">{title}</p>
        </div>
    </Card>
  );


  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-textDisplay">Parent Dashboard</h1>
      <p className="text-md text-textBody">Welcome, {currentUser?.name}. Here are the latest updates for your family.</p>

      {isLoading && !metrics ? (
        <div className="flex justify-center items-center py-10"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
        {metrics && (
            <Card title="My Family Snapshot" className="!pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 p-0 pt-3">
                     <StatCard icon={IdentificationIcon} title="Children Linked" value={metrics.childrenCount} iconColorClass="text-primary" />
                </div>
            </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold text-textDisplay">Consolidated Feed</h2>
                {isLoading && allPostsForFeed.length === 0 ? <LoadingSpinner/> :
                 allPostsForFeed.length > 0 ? (
                    allPostsForFeed.slice(0, 5).map(post => ( // Limit initial display for compactness
                    <div key={`${post.id}-${post.studentId}`} className="relative group">
                        <FeedCard post={post} />
                        <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm transition-opacity duration-300 opacity-90 group-hover:opacity-100
                            ${post.isGlobal ? 'bg-primary/80 text-textOnPrimary' : 'bg-secondary text-textOnSecondary'}`}>
                            {post.isGlobal ? 'School News' : 
                                <Link to={`/child/${post.studentId}/feed`} className="hover:underline">
                                    For {post.studentName}
                                </Link>
                            }
                        </div>
                    </div>
                    ))
                ) : (
                    <Card><p className="text-textSubtle text-center py-6">No updates available at the moment.</p></Card>
                )}
            </div>
            <div className="lg:col-span-1 space-y-4">
                {childrenFeeds.length > 0 && (
                  <Card title="Your Children">
                      {/* <UserIcon className="h-8 w-8 text-primary mx-auto mb-2"/> // Removed redundant icon */}
                      <ul className="divide-y divide-borderLight">
                          {childrenFeeds.map(feed => (
                              <li key={feed.student.id} className="py-3">
                                  <Link to={`/child/${feed.student.id}/feed`} className="block hover:bg-bgMuted p-2 rounded-md -m-2 transition-colors group">
                                      <div className="flex items-center space-x-2.5 mb-1">
                                          <Avatar src={feed.student.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER} alt={feed.student.name} size="sm" />
                                          <div>
                                              <p className="text-sm font-semibold text-textBody group-hover:text-primary">{feed.student.name}</p>
                                          </div>
                                          <ArrowRightIcon className="h-4 w-4 text-textSubtle ml-auto opacity-0 group-hover:opacity-100 transition-opacity"/>
                                      </div>
                                      <div className="pl-[calc(2rem+0.625rem)] text-xs text-textSubtle"> {/* Avatar sm (2rem) + space-x-2.5 (0.625rem) */}
                                        <p>Class: {feed.className}</p>
                                        <p>Teacher: {feed.teacherName}</p>
                                      </div>
                                  </Link>
                              </li>
                          ))}
                      </ul>
                  </Card>
                )}
                 <UpcomingEventsCard
                    title="Upcoming For Your Family"
                    events={upcomingPersonalizedEvents}
                    isLoading={isLoading && upcomingPersonalizedEvents.length === 0}
                    maxEvents={3} // Reduced maxEvents for compactness
                />
            </div>
        </div>
        </>
      )}
       {metrics?.childrenCount === 0 && !isLoading && (
         <Card>
            <p className="text-textSubtle text-center py-8">No children are currently linked to your account. Please contact an administrator if this is an error.</p>
        </Card>
      )}
    </div>
  );
};

export default ParentDashboard;