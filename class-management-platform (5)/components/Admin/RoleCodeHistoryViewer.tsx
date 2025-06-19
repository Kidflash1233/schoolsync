import React, { useEffect, useState } from 'react';
import { fetchRoleCodeHistory, fetchAllUsers } from '../../services/apiService';
import { RoleCodeHistoryEntry, User, UserRole } from '../../types';
import { ROLE_DISPLAY_NAMES } from '../../constants';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import Button from '../UI/Button';
import { format } from 'date-fns';
import { KeyIcon, UserCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const RoleCodeHistoryViewer: React.FC = () => {
  const [history, setHistory] = useState<RoleCodeHistoryEntry[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [historyData, usersData] = await Promise.all([
        fetchRoleCodeHistory(),
        fetchAllUsers(),
      ]);
      setHistory(historyData);
      const uMap = new Map<string, User>();
      usersData.forEach(user => uMap.set(user.id, user));
      setUsersMap(uMap);
    } catch (err) {
      console.error("Failed to load role code history:", err);
      setError("Could not load role code history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.TEACHER: return 'bg-blue-100 text-blue-800';
      case UserRole.PARENT: return 'bg-green-100 text-green-800';
      case UserRole.STUDENT_USER: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <KeyIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-neutral-dark">Role Invitation Code History</h1>
        </div>
        <Button onClick={loadData} variant="outline" size="md" disabled={isLoading}>
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh History
        </Button>
      </div>

      {error && <p className="text-danger text-center p-4 bg-red-50 rounded-md border border-red-200">{error}</p>}

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
            <p className="ml-3 text-gray-500">Loading history...</p>
          </div>
        ) : history.length === 0 && !error ? (
          <div className="p-10 text-center text-gray-500">
            <UserCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold">No Role Code History Found</h3>
            <p className="mt-1">Invitation codes will appear here once they are generated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invitation Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((entry) => {
                  const user = usersMap.get(entry.userId);
                  const isPredefined = new Date(entry.createdAt).getFullYear() < 1971; // Check if epoch date
                  return (
                    <tr key={entry.code}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-dark">{user?.name || entry.userId}</div>
                        {user && user.name !== entry.userId && <div className="text-xs text-gray-500">{entry.userId}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(entry.role)}`}>
                          {ROLE_DISPLAY_NAMES[entry.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{entry.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isPredefined ? (
                            <span title="This code was pre-defined in the system.">Pre-defined</span>
                        ) : (
                            format(new Date(entry.createdAt), 'MMM d, yyyy, p')
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RoleCodeHistoryViewer;