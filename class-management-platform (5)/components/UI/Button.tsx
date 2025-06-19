
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150';
  
  const variantStyles = {
    primary: 'bg-primary text-textOnPrimary hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-secondary text-textOnSecondary hover:bg-secondary-hover focus:ring-secondary-border border border-secondary-border',
    danger: 'bg-danger text-danger-text hover:bg-red-600 focus:ring-red-700',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary', // Updated for subtle hover
    outline: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary', // Updated for subtle hover
    success: 'bg-success text-success-text hover:bg-green-600 focus:ring-green-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg', // Slightly adjusted padding for lg
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${variant === 'primary' || variant === 'danger' || variant === 'success' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;