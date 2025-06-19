
// This component is now deprecated and its functionality has been merged into:
// - ManagementHub.tsx (main orchestration)
// - UnifiedEntityList.tsx (displaying students)
// - CreateEntityWizardModal.tsx (creating/editing student properties)
// - ManageLinksModal.tsx (linking students to classes/parents)
// This file can be safely removed in a future cleanup if no longer referenced.

import React from 'react';

const DeprecatedManageStudentsSection: React.FC = () => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
      <p className="font-semibold text-yellow-800">Note: Student Management has been overhauled!</p>
      <p className="text-yellow-700">
        This specific section component is deprecated. Student management is now part of the unified "Entity Management Hub" experience.
      </p>
    </div>
  );
};

export default DeprecatedManageStudentsSection;
