import React from 'react';
import { X } from 'lucide-react';
import { ResearchPromptBuilder } from './ResearchPromptBuilder';

interface ResearchPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchPromptModal: React.FC<ResearchPromptModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-7xl max-h-[95vh] bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        {/* Research Prompt Builder */}
        <div className="overflow-y-auto max-h-[95vh]">
          <ResearchPromptBuilder onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ResearchPromptModal;