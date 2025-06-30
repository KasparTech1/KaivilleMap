import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SimpleEditButton: React.FC = () => {
  const navigate = useNavigate();
  
  // Inline styles to ensure visibility
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    zIndex: 99999,
    display: 'block',
  };

  return (
    <button 
      style={buttonStyle}
      onClick={() => navigate('/admin')}
    >
      🔧 Admin Panel
    </button>
  );
};