import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './AdminAuth.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Admin authentication modal component
 */
export const AdminAuth = ({ onAuthenticated, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the authentication function
      const { data, error } = await supabase.rpc('create_admin_session', {
        password: password,
        ip: window.location.hostname,
        agent: navigator.userAgent
      });

      if (error || !data?.success) {
        throw new Error(data?.message || 'Authentication failed');
      }

      // Store session token
      localStorage.setItem('kaiville_admin_token', data.token);
      
      // Set cookie for server-side validation
      document.cookie = `admin_session=${data.token}; path=/; max-age=86400; samesite=strict`;

      onAuthenticated(data.token);
    } catch (err) {
      setError(err.message || 'Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth-overlay" onClick={onClose}>
      <div className="admin-auth-modal" onClick={e => e.stopPropagation()}>
        <button className="admin-auth-close" onClick={onClose}>×</button>
        
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
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Admin context provider for managing edit mode
 */
export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('kaiville_admin_token');
    if (token) {
      validateSession(token);
    }
  }, []);

  const validateSession = async (token) => {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (data && !error) {
        setIsAdmin(true);
        setAdminToken(token);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    }
  };

  const login = (token) => {
    setIsAdmin(true);
    setAdminToken(token);
  };

  const logout = () => {
    localStorage.removeItem('kaiville_admin_token');
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsAdmin(false);
    setAdminToken(null);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, adminToken, login, logout }}>
      {children}
      {isAdmin && <div className="admin-mode-indicator">Admin Mode Active</div>}
    </AdminContext.Provider>
  );
};

export const AdminContext = React.createContext({
  isAdmin: false,
  adminToken: null,
  login: () => {},
  logout: () => {}
});

/**
 * Hook to use admin context
 */
export const useAdmin = () => {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

/**
 * Admin edit button component
 */
export const AdminEditButton = ({ onClick }) => {
  const [showAuth, setShowAuth] = useState(false);
  const { isAdmin, login, logout } = useAdmin();

  const handleClick = () => {
    if (isAdmin) {
      onClick?.();
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthenticated = (token) => {
    login(token);
    setShowAuth(false);
    onClick?.();
  };

  if (isAdmin) {
    return (
      <button 
        className="admin-edit-button admin-edit-button-active" 
        onClick={logout}
        title="Click to logout"
      >
        🔓 Exit Admin
      </button>
    );
  }

  return (
    <>
      <button 
        className="admin-edit-button" 
        onClick={handleClick}
        title="Click to enter admin mode"
      >
        🔒 Admin
      </button>
      
      {showAuth && (
        <AdminAuth 
          onAuthenticated={handleAuthenticated}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
};