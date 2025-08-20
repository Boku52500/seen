import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-black rounded-full animate-spin`}></div>
      <div className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
        {text}
      </div>
    </div>
  );
};

export default LoadingSpinner;
