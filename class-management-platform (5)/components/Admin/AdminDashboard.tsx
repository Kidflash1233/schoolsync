import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import UpcomingEventsCard from '../Dashboard/UpcomingEventsCard';
import { fetchAllUsers, fetchAllStudents, fetchAllClasses, fetchCalendarItemsForUser } from '../../services/apiService';
import { User, Student, Class, CalendarDisplayItem } from '../../types';
import { UsersIcon, AcademicCapIcon, RectangleStackIcon, KeyIcon, ArrowRightIcon, CubeTransparentIcon, BuildingLibraryIcon, BriefcaseIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'; // Added BriefcaseIcon and Chevron icons

interface AdminMetrics {
  usersCount: number;
  studentsCount: number;
  classesCount: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const [users, students, classes, calendarItems] = await Promise.all([
          fetchAllUsers(),
          fetchAllStudents(),
          fetchAllClasses(),
          fetchCalendarItemsForUser(currentUser.id, currentUser.role)
        ]);
        setMetrics({
          usersCount: users.length,
          studentsCount: students.length,
          classesCount: classes.filter(c => c.id !== 'master-class-global').length,
        });
        
        const futureEvents = calendarItems
          .filter(event => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setUpcomingEvents(futureEvents);

      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const toggleOverviewCollapse = () => {
    setIsOverviewCollapsed(!isOverviewCollapsed);
  };

  if (!currentUser) return null;

  const quickLinks = [
    { title: 'Management Hub', description: 'Manage users, students, and classes.', to: '/admin/management-hub', icon: BriefcaseIcon }, // Changed icon
    { title: 'Global Feeds', description: 'Post school-wide announcements.', to: '/global-feeds', icon: AcademicCapIcon },
    { title: 'School Settings', description: 'Configure platform-wide settings.', to: '/admin/school-settings', icon: BuildingLibraryIcon },
  ];

  const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, iconColorClass?: string }> = ({ icon: Icon, title, value, iconColorClass = 'text-primary' }) => (
    <Card className="shadow-sm flex-1 rounded-md text-center"> {/* Centered text */}
        <div className="p-3"> {/* Reduced padding */}
            <Icon className={`h-7 w-7 ${iconColorClass} mx-auto mb-1.5`} /> {/* Slightly larger icon, centered, margin bottom */}
            <p className="text-xl font-semibold text-textDisplay">{value}</p> {/* Larger font for value */}
            <p className="text-xs text-textSubtle mt-0.5">{title}</p>
        </div>
    </Card>
  );


  return (
    <div className="space-y-5"> {/* Adjusted spacing */}
      <h1 className="text-2xl font-semibold text-textDisplay">Admin Dashboard</h1> {/* Slightly smaller h1 */}
      <p className="text-md text-textBody">Welcome, {currentUser.name}. Manage your school platform efficiently.</p>
      
      {isLoading && !metrics ? ( // Show main loader only if metrics are not yet loaded
        <div className="flex justify-center items-center py-10"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          <Card 
            title="Platform Overview" 
            className="!pt-0"
            titleActions={
              <button
                onClick={toggleOverviewCollapse}
                className="p-1 rounded-md text-textSubtle hover:bg-bgMuted focus:outline-none focus:ring-2 focus:ring-primary"
                aria-expanded={!isOverviewCollapsed}
                aria-controls="platform-overview-content"
              >
                <span className="sr-only">{isOverviewCollapsed ? 'Expand' : 'Collapse'} Platform Overview</span>
                {isOverviewCollapsed ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5" />
                )}
              </button>
            }
          >
            {isLoading && !metrics && ( // Show inline loader if main loading is done but metrics still fetching (edge case)
                 <div className="flex justify-center items-center py-5"><LoadingSpinner size="md" /></div>
            )}
            {!isOverviewCollapsed && (
              <div id="platform-overview-content">
                {metrics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-0 pt-3"> {/* Reduced gap and padding */}
                    <StatCard icon={UsersIcon} title="Total Users" value={metrics.usersCount} iconColorClass="text-primary" />
                    <StatCard icon={AcademicCapIcon} title="Total Students" value={metrics.studentsCount} iconColorClass="text-success-DEFAULT" />
                    <StatCard icon={RectangleStackIcon} title="Total Classes" value={metrics.classesCount} iconColorClass="text-orange-500" />
                  </div>
                ) : !isLoading && ( // Show error only if not loading
                  <p className="text-textSubtle text-center py-5">Could not load platform metrics.</p>
                )}
              </div>
            )}
            {isOverviewCollapsed && (
                 <div id="platform-overview-content" className="p-0 pt-3">
                    <p className="text-textSubtle text-xs text-center pb-2">Overview is collapsed. Click the icon to expand.</p>
                </div>
            )}
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> {/* Adjusted gap */}
            <div className="lg:col-span-2">
                 <UpcomingEventsCard
                    title="Upcoming School Events & Dates"
                    events={upcomingEvents}
                    isLoading={isLoading && upcomingEvents.length === 0}
                    maxEvents={5}
                  />
            </div>
            <div className="space-y-4 lg:col-span-1"> {/* Adjusted space-y */}
                {quickLinks.slice(0,1).map(link => ( // Prominent first quick link
                    <Card key={link.to} className="shadow-sm hover:shadow-md transition-shadow duration-300 h-full rounded-md">
                        <div className="p-4 text-center"> {/* Centered content */}
                            <link.icon className="h-10 w-10 text-primary mx-auto mb-2" /> {/* Larger icon */}
                            <h2 className="text-md font-semibold text-textDisplay mb-1">{link.title}</h2>
                            <p className="text-sm text-textSubtle mb-3 h-10 overflow-hidden">{link.description}</p>
                            <Link to={link.to} className="inline-flex items-center text-primary hover:text-primary-hover font-medium group text-sm">
                                Go to {link.title.split(' ')[0]}
                                <ArrowRightIcon className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
          </div>
           <Card title="Quick Links">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Adjusted gap */}
                {quickLinks.slice(1).map(link => (
                <Link key={link.to} to={link.to} className="block p-3 bg-bgMuted hover:bg-slate-200 rounded-md shadow-xs transition-all duration-200 ease-in-out hover:shadow-sm border border-borderLight"> {/* Subtle styling */}
                    <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary"> {/* Icon bg using primary with opacity */}
                        <link.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-textBody">{link.title}</h3>
                        <p className="text-xs text-textSubtle">{link.description}</p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-textSubtle ml-auto shrink-0"/>
                    </div>
                </Link>
                ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;