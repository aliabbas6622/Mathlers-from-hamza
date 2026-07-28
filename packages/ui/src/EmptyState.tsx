'use client';

import React from 'react';
import { FileX, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'file' | 'alert' | 'custom';
  customIcon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file',
  customIcon,
  title,
  description,
  action,
}) => {
  const icons: Record<string, React.ReactNode> = {
    search: <Search className="w-16 h-16 text-gray-300" />,
    file: <FileX className="w-16 h-16 text-gray-300" />,
    alert: <AlertCircle className="w-16 h-16 text-gray-300" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4">
        {customIcon || (icon !== 'custom' && icons[icon])}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="glass-button px-6 py-3 text-white font-semibold rounded-xl"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
