import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading module...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-3">
      <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-300/40 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
      </div>
      <p className="text-xs font-medium text-stone-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
