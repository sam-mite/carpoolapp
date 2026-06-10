import React from 'react';

const GlowCard = ({ children, className = '', interactive = true, style = {}, ...props }) => {
  return (
    <div 
      className={`glass-card ${interactive ? 'interactive' : ''} ${className}`}
      style={{
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlowCard;
