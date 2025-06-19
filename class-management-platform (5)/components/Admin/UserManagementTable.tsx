// This component is now deprecated and its functionality has been moved to:
// components/Admin/ManagementHub/ManageUsersSection.tsx
// This file can be safely removed in a future cleanup if no longer referenced.

import React from 'react';

const DeprecatedUserManagementTable: React.FC = () => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
      <p className="font-semibold text-yellow-800">Note: User Management has moved!</p>
      <p className="text-yellow-700">
        This component is deprecated. User management is now handled within the "Management Hub".
      </p>
    </div>
  );
};

export default DeprecatedUserManagementTable;
