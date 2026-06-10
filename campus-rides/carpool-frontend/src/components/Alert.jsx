import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: {
      bg: 'var(--neon-green-glow)',
      color: 'var(--neon-green)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    error: {
      bg: 'var(--error-glow)',
      color: 'var(--error)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    warning: {
      bg: 'var(--warning-glow)',
      color: 'var(--warning)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    info: {
      bg: 'var(--neon-cyan-glow)',
      color: 'var(--neon-cyan)',
      border: 'rgba(6, 182, 212, 0.3)',
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div 
      style={{
        backgroundColor: currentStyle.bg,
        color: currentStyle.color,
        border: `1px solid ${currentStyle.border}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        animation: 'fadeIn 0.3s ease-out',
        width: '100%',
        textAlign: 'left'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
            padding: '0 4px',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.7}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
