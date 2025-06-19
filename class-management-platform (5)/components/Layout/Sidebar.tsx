
import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { UserRole, NavItemConfig, Class, Student } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { fetchClassesByTeacherId, fetchStudentsByParentId } from '../../services/apiService';
import { HomeIcon, UsersIcon, KeyIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, BookOpenIcon, UserGroupIcon, IdentificationIcon, CalendarDaysIcon, Cog6ToothIcon, BuildingLibraryIcon, XMarkIcon, CubeTransparentIcon, ChevronDownIcon, PlusCircleIcon } from '@heroicons/react/24/outline'; // Added PlusCircleIcon
import { APP_NAME } from '../../constants';


interface SidebarProps {
  userRole: UserRole;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const NavItemLink: React.FC<{ item: NavItemConfig; isChild?: boolean; onClick?: () => void }> = ({ item, isChild = false, onClick }) => (
  <NavLink
    to={item.to}
    end={item.end !== undefined ? item.end : true}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors duration-150 ease-in-out ${ // Reduced padding
        isChild ? 'pl-8' : '' // Adjusted child padding
      } ${
        isActive
          ? 'bg-navActiveBg text-navActiveText'
          : 'text-navText hover:bg-navHoverBg hover:text-textDisplay'
      }`
    }
  >
    {item.icon && <item.icon className={`h-5 w-5 mr-2.5 flex-shrink-0 ${isChild ? 'h-4 w-4' : ''} ${ (item.to === (item as any).isActive) ? 'text-navActiveText' : 'text-navIcon group-hover:text-textDisplay'}`} aria-hidden="true" />}
    {item.label}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ userRole, isSidebarOpen, toggleSidebar }) => {
  const { currentUser } = useAuth();
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [parentStudents, setParentStudents] = useState<Student[]>([]);

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(true);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(true);

  useEffect(() => {
    if (currentUser?.role === UserRole.TEACHER && currentUser.id) {
      fetchClassesByTeacherId(currentUser.id).then(setTeacherClasses);
    }
    if (currentUser?.role === UserRole.PARENT && currentUser.id) {
      fetchStudentsByParentId(currentUser.id).then(setParentStudents);
    }
  }, [currentUser]);

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const baseNavItems: NavItemConfig[] = [
    { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  ];

  const commonNavItems: NavItemConfig[] = [
    { to: '/calendar', label: 'School Calendar', icon: CalendarDaysIcon },
    { to: '/profile', label: 'My Profile', icon: Cog6ToothIcon },
  ];

  let roleSpecificNavItems: NavItemConfig[] = [];

  switch (userRole) {
    case UserRole.ADMIN:
      roleSpecificNavItems = [
        ...baseNavItems,
        { to: '/admin/management-hub', label: 'Management Hub', icon: CubeTransparentIcon as React.ElementType, end:false },
        { to: '/global-feeds', label: 'Global Feeds', icon: BookOpenIcon }, // Changed icon for consistency
        { to: '/admin/school-settings', label: 'School Settings', icon: BuildingLibraryIcon },
        ...commonNavItems,
      ];
      break;
    case UserRole.TEACHER:
      const classNavs: NavItemConfig[] = teacherClasses.map(cls => ({
        to: `/class/${cls.id}/feed`,
        label: cls.name,
        icon: UserGroupIcon,
        end: false,
      }));
      roleSpecificNavItems = [
        ...baseNavItems,
        { to: '/create-post', label: 'New Post', icon: PlusCircleIcon }, // Changed icon
        ...(classNavs.length > 0 ? [{ label: "My Classes", to:"#", icon: AcademicCapIcon, children: classNavs, isOpen: isClassDropdownOpen, onToggle: () => setIsClassDropdownOpen(!isClassDropdownOpen) } as NavItemConfig & {children: NavItemConfig[], isOpen?: boolean, onToggle?: () => void }]: []),
        { to: '/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
        ...commonNavItems,
      ];
      break;
    case UserRole.PARENT:
      const studentNavs: NavItemConfig[] = parentStudents.map(student => ({
        to: `/child/${student.id}/feed`,
        label: `${student.name}'s Updates`,
        icon: IdentificationIcon,
        end: false,
      }));
       roleSpecificNavItems = [
        ...baseNavItems,
        ...(studentNavs.length > 0 ? [{ label: "My Children", to:"#", icon: UsersIcon, children: studentNavs, isOpen: isStudentDropdownOpen, onToggle: () => setIsStudentDropdownOpen(!isStudentDropdownOpen) } as NavItemConfig & {children: NavItemConfig[], isOpen?: boolean, onToggle?: () => void }]: []),
        { to: '/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
        ...commonNavItems,
      ];
      break;
  }

  return (
    <aside
      id="mobile-sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-bgSurface shadow-lg p-3 flex flex-col border-r border-borderLight
                 transform transition-transform duration-300 ease-in-out pt-14
                 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-borderLight">
        <Link to="/" className="text-primary text-lg font-semibold hover:text-primary-hover" onClick={handleMobileNavClick}>
          {APP_NAME}
        </Link>
        <div className="lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-textSubtle hover:text-textDisplay hover:bg-bgMuted focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {roleSpecificNavItems.map((item) => (
          item.children ? (
            <div key={item.label}>
              <button
                onClick={(item as any).onToggle}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-navText hover:bg-navHoverBg hover:text-textDisplay rounded-md focus:outline-none"
              >
                <span className="flex items-center">
                  {item.icon && <item.icon className="h-5 w-5 mr-2.5 flex-shrink-0 text-navIcon group-hover:text-textDisplay" aria-hidden="true" />}
                  {item.label}
                </span>
                <ChevronDownIcon className={`h-4 w-4 text-navIcon transform transition-transform duration-150 ${(item as any).isOpen ? 'rotate-180' : ''}`} />
              </button>
              {(item as any).isOpen && (
                <div className="space-y-0.5 pl-2 mt-0.5">
                  {item.children.map(childItem => <NavItemLink key={childItem.to} item={childItem} isChild onClick={handleMobileNavClick} />)}
                </div>
              )}
            </div>
          ) : (
            <NavItemLink key={item.to} item={item} onClick={handleMobileNavClick} />
          )
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
