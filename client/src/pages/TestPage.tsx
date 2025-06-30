import React from 'react';
import { EditButton } from '../components/cms/EditButton';

export const TestPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', padding: '20px' }}>
      <h1>Edit Button Test Page</h1>
      <p>If the edit button is working, you should see a red button in the bottom-right corner.</p>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>Current URL: {window.location.href}</li>
          <li>Admin Token exists: {localStorage.getItem('adminToken') ? 'Yes' : 'No'}</li>
          <li>Environment: {process.env.NODE_ENV}</li>
        </ul>
      </div>

      <EditButton editPath="/admin/test" label="Edit Test" />
    </div>
  );
};