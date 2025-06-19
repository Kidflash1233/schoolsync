
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchClassesByTeacherId, fetchStudentsByClassId, fetchCalendarItemsForUser } from '../../services/apiService';
import { Class, Student, CalendarDisplayItem } from '../../types';
import LoadingSpinner from '../UI/LoadingSpinner';
import Card from '../UI/Card';
import Button from '../UI/Button';
import UpcomingEventsCard from '../Dashboard/UpcomingEventsCard';
import { BookOpenIcon, PlusCircleIcon, ArrowRightIcon, UserGroupIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline'; // Changed icon

interface TeacherMetrics {
  classesTaughtCount: number;
  totalStudentsCount: number;
}

const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [metrics, setMetrics] = useState<TeacherMetrics | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser || !currentUser.id) return;
      setIsLoading(true);
      try {
        const teacherClasses = await fetchClassesByTeacherId(currentUser.id);
        setClasses(teacherClasses);

        let studentCount = 0;
        if (teacherClasses.length > 0) {
          const studentPromises = teacherClasses.map(cls => fetchStudentsByClassId(cls.id));
          const studentsPerClass = await Promise.all(studentPromises);
          studentCount = studentsPerClass.reduce((sum, classStudents) => sum + classStudents.length, 0);
        }
        setMetrics({
          classesTaughtCount: teacherClasses.length,
          totalStudentsCount: studentCount,
        });
        
        const classIds = teacherClasses.map(c => c.id);
        const calendarItems = await fetchCalendarItemsForUser(currentUser.id, currentUser.role, undefined, classIds);
        const futureEvents = calendarItems
          .filter(event => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setUpcomingEvents(futureEvents);

      } catch (error) {
        console.error("Failed to load teacher dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  if (isLoading && !metrics && classes.length === 0) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

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
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold text-textDisplay">Teacher Dashboard</h1>
        <Link to="/create-post" className="mt-3 sm:mt-0">
          <Button variant="primary">
            <PlusCircleIcon className="h-5 w-5 mr-1.5 inline"/> New Post
          </Button>
        </Link>
      </div>
      <p className="text-md text-textBody">Welcome, {currentUser?.name}. Manage your classes and engage with students.</p>

      {isLoading && !metrics ? (
         <div className="flex justify-center items-center py-10"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
        <Card title="My Overview" className="!pt-0">
          {metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-0 pt-3">
                <StatCard icon={PresentationChartLineIcon} title="Classes Taught" value={metrics.classesTaughtCount} iconColorClass="text-primary" />
                <StatCard icon={UserGroupIcon} title="Total Students Enrolled" value={metrics.totalStudentsCount} iconColorClass="text-success-DEFAULT" />
            </div>
          ) : (
             <p className="text-textSubtle text-center py-5">Could not load teaching metrics.</p>
          )}
        </Card>

        <UpcomingEventsCard
            title="Upcoming For Your Classes"
            events={upcomingEvents}
            isLoading={isLoading && upcomingEvents.length === 0}
            maxEvents={5}
        />
        </>
      )}

      <div>
        <h2 className="text-xl font-semibold text-textDisplay mb-3">My Classes</h2>
        {isLoading && classes.length === 0 ? (
          <div className="flex justify-center py-6"><LoadingSpinner /></div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow duration-300">
                  <div className="p-4"> {/* Removed colored header */}
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-primary/10 rounded-full mr-3">
                            <BookOpenIcon className="h-6 w-6 text-primary"/>
                        </div>
                        <h2 className="text-md font-semibold text-textDisplay truncate" title={cls.name}>{cls.name}</h2>
                      </div>
                      <p className="text-sm text-textSubtle mb-3 h-10 line-clamp-2">Manage posts, students, and events for this class.</p> {/* line-clamp for description */}
                       <Link to={`/class/${cls.id}/feed`} className="inline-flex items-center text-primary hover:text-primary-hover font-medium group text-sm">
                          View Class
                          <ArrowRightIcon className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                  </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
              <p className="text-textSubtle text-center py-8">You are not currently assigned to any classes. Please contact an administrator.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;