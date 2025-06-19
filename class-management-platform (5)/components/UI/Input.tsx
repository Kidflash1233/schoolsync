
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-textBody mb-1">{label}</label>}
      <input
        id={id}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-danger' : 'border-borderDefault'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-textBody placeholder-textSubtle bg-bgSurface ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};

export default Input;