
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out">
      <div className="bg-bgSurface rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full m-4 border border-borderLight" role="dialog" aria-modal="true" aria-labelledby={typeof title === 'string' ? "modal-title" : undefined}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {title && (typeof title === 'string' ? 
              <h3 className="text-lg leading-6 font-semibold text-textDisplay" id="modal-title">{title}</h3> 
              : <div className="text-lg leading-6 font-semibold text-textDisplay" id="modal-title-container">{title}</div>
            )}
            <button
              onClick={onClose}
              className="text-textSubtle hover:text-textBody transition rounded-full p-1 hover:bg-bgMuted"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4">
            {children}
          </div>
        </div>
        {footer && (
          <div className="bg-bgMuted px-6 py-3 sm:flex sm:flex-row-reverse rounded-b-lg border-t border-borderLight">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;