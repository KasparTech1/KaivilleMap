import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Lock } from 'lucide-react';
import { AdminAuth } from './AdminAuth';
import './EditButton.css';

interface EditButtonProps {
  editPath: string; // Where to navigate when authenticated
  label?: string;
}

export const EditButton: React.FC<EditButtonProps> = ({ editPath, label = 'Edit Page' }) => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleClick = () => {
    if (isAuthenticated) {
      navigate(editPath);
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    navigate(editPath);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="edit-button"
        title={isAuthenticated ? label : 'Login to edit'}
      >
        {isAuthenticated ? (
          <>
            <Edit3 className="w-4 h-4" />
            <span className="edit-button-text">{label}</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span className="edit-button-text">Admin</span>
          </>
        )}
      </button>

      {showAuth && (
        <AdminAuth 
          onAuthenticated={handleAuthenticated}
          onCancel={() => setShowAuth(false)}
        />
      )}
    </>
  );
};