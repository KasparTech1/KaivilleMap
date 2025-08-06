import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-to-content"
      onClick={(e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      Skip to main content
    </a>
  );
};