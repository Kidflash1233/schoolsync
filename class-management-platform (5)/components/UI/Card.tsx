import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  actions?: ReactNode; // Slot for buttons or links at the bottom
  titleActions?: ReactNode; // Slot for buttons or icons in the title bar
}

const Card: React.FC<CardProps> = ({ children, title, className = '', titleClassName = '', bodyClassName = '', actions, titleActions }) => {
  return (
    <div className={`bg-bgSurface shadow-sm rounded-lg border border-borderLight overflow-hidden ${className}`}>
      {title && (
        <div className={`flex items-center justify-between px-4 py-3 border-b border-borderLight ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-textDisplay">{title}</h3>
          {titleActions && <div>{titleActions}</div>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      {actions && (
        <div className="px-4 py-3 bg-bgMuted border-t border-borderLight">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;