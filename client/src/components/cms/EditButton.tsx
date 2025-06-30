import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { SimpleAdminAuth } from './SimpleAdminAuth';
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
    console.log('EditButton mounted with editPath:', editPath);
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
        <Wrench className="w-5 h-5" />
      </button>

      {showAuth && (
        <SimpleAdminAuth 
          onAuthenticated={handleAuthenticated}
          onCancel={() => setShowAuth(false)}
        />
      )}
    </>
  );
};