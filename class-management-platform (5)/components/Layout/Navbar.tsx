
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../constants'; // ROLE_DISPLAY_NAMES removed as it's not used here anymore
import Button from '../UI/Button';
import Avatar from '../UI/Avatar';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-bgSurface shadow-sm border-b border-borderLight sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"> {/* Changed to max-w-full for potentially wider layouts */}
        <div className="flex items-center justify-between h-14"> {/* Reduced height to h-14 */}
          <div className="flex items-center">
            {currentUser && (
              <div className="mr-2 lg:hidden">
                <button
                  onClick={onToggleSidebar}
                  className="inline-flex items-center justify-center p-2 rounded-md text-textBody hover:text-textDisplay hover:bg-bgMuted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  aria-expanded={isSidebarOpen}
                  aria-controls="mobile-sidebar"
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            )}
            <Link to="/" className="text-textDisplay text-xl font-semibold hover:text-primary">
              {APP_NAME}
            </Link>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-3"> {/* Reduced space-x-4 to space-x-3 */}
              <div className="flex items-center space-x-2">
                <Avatar src={currentUser.avatarUrl} size="sm" />
                <div className="hidden sm:block"> {/* Hide text on very small screens if needed */}
                  <div className="text-sm font-medium text-textBody">{currentUser.name}</div>
                  {/* Role display removed for cleaner look, avatar implies user context */}
                </div>
              </div>
              <Button onClick={logout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;