import React from 'react';

const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className="animate-spin rounded-full border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent"
        style={{
          width: size === 'small' ? '16px' : size === 'large' ? '48px' : '32px',
          height: size === 'small' ? '16px' : size === 'large' ? '48px' : '32px',
          borderWidth: size === 'small' ? '2px' : size === 'large' ? '4px' : '3px',
          borderStyle: 'solid',
          borderColor: 'rgba(255,255,255,0.1)',
          borderTopColor: 'var(--neon-green)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
    </div>
  );
};

export default Spinner;
