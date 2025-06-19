import React from 'react';
import Card from '../UI/Card';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const RoleCodeGenerator: React.FC = () => {
  return (
    <Card title="Role Code Generation (Deprecated)">
      <div className="p-6 text-center">
        <InformationCircleIcon className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-lg text-neutral-dark">
          Role code generation is now integrated into the user creation process within the <strong>Management Hub</strong>.
        </p>
        <p className="text-gray-600 mt-2">
          When you create a new Teacher or Parent user in the Management Hub, an invitation code will be automatically generated and displayed.
        </p>
      </div>
    </Card>
  );
};

export default RoleCodeGenerator;
// This component is now effectively deprecated. 
// The main logic for generating codes is in apiService.ts (_generateAndStoreInvitationCode)
// and it's called during user creation in ManageUsersSection.tsx (part of ManagementHub).
// This file can be removed in a future cleanup if no longer linked.
