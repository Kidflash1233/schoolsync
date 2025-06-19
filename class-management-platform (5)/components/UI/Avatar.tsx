
import React from 'react';
import { DEFAULT_AVATAR_PLACEHOLDER } from '../../constants';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'User Avatar', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <img
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      src={src || DEFAULT_AVATAR_PLACEHOLDER}
      alt={alt}
    />
  );
};

export default Avatar;
