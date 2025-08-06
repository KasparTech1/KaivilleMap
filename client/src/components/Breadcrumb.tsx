import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <div className="breadcrumb-item">
        <Link to="/" className="text-[#1f4e79] hover:text-[#D4AF37] transition" aria-label="Return to map">
          <Home className="w-4 h-4" />
        </Link>
      </div>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 breadcrumb-separator" aria-hidden="true" />
          <div className="breadcrumb-item">
            {item.current ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : item.path ? (
              <Link to={item.path} className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};