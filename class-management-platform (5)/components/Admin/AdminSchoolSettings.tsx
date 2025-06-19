import React from 'react';
import Card from '../UI/Card';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';

const AdminSchoolSettings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-dark mb-6">School Settings</h1>
      <Card title="Manage School Configuration">
        <div className="flex flex-col items-center justify-center p-10 text-center">
            <BuildingLibraryIcon className="h-16 w-16 text-secondary mb-4" />
            <p className="text-xl text-gray-600">
                This section will allow administrators to manage global school settings such as academic year dates, school branding, and other platform-wide configurations.
            </p>
            <p className="mt-4 text-md text-gray-500">
                (Feature Coming Soon)
            </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminSchoolSettings;