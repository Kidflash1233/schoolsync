
import React, { ReactNode } from 'react';
import { UserRole } from '../../types';
import Sidebar from './Sidebar';

interface PageContainerProps {
  children: ReactNode;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userRole: UserRole;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, isSidebarOpen, toggleSidebar, userRole }) => {
  return (
    <div className="flex flex-1"> {/* Root div of PageContainer */}
      <Sidebar userRole={userRole} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area needs padding top to account for the sticky Navbar and margin-left for the sidebar on large screens */}
      <main className="flex-1 p-4 md:p-6 pt-14 overflow-y-auto lg:ml-64 bg-bgPage">
        {children}
      </main>
    </div>
  );
};

export default PageContainer;
