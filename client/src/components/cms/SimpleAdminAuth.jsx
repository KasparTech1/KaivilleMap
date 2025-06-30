import React, { useState } from 'react';
import './AdminAuth.css';

export const SimpleAdminAuth = ({ onAuthenticated, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple password check
    if (password === 'kaiville25') {
      // Generate a simple token
      const token = btoa(`admin-${Date.now()}-${Math.random()}`);
      
      // Store the token
      localStorage.setItem('adminToken', token);
      
      // Call the callback
      setTimeout(() => {
        setIsLoading(false);
        if (onAuthenticated) {
          onAuthenticated();
        }
      }, 500); // Small delay for UX
    } else {
      setTimeout(() => {
        setError('Invalid password. Please try again.');
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="admin-auth-overlay" onClick={onCancel}>
      <div className="admin-auth-modal" onClick={e => e.stopPropagation()}>
        <button className="admin-auth-close" onClick={onCancel}>×</button>
        
        <h2>Admin Access</h2>
        <p>Enter the admin password to enable editing mode</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="admin-auth-input"
            autoFocus
            disabled={isLoading}
          />
          
          {error && <div className="admin-auth-error">{error}</div>}
          
          <div className="admin-auth-actions">
            <button 
              type="submit" 
              className="admin-auth-submit"
              disabled={isLoading || !password}
            >
              {isLoading ? 'Authenticating...' : 'Unlock Editing'}
            </button>
            <button 
              type="button" 
              className="admin-auth-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};