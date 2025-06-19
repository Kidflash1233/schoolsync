
// This component is now deprecated and its functionality has been merged into:
// - ManagementHub.tsx (main orchestration)
// - UnifiedEntityList.tsx (displaying classes)
// - CreateEntityWizardModal.tsx (creating/editing class properties)
// - ManageLinksModal.tsx (linking classes to teachers/students)
// This file can be safely removed in a future cleanup if no longer referenced.

import React from 'react';

const DeprecatedManageClassesSection: React.FC = () => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
      <p className="font-semibold text-yellow-800">Note: Class Management has been overhauled!</p>
      <p className="text-yellow-700">
        This specific section component is deprecated. Class management is now part of the unified "Entity Management Hub" experience.
      </p>
    </div>
  );
};

export default DeprecatedManageClassesSection;
