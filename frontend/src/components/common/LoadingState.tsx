import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Synchronizing Prism metrics...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="w-full min-h-[240px] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
        <Loader2 className={`${sizeClasses[size]} text-cyan-400 animate-spin relative z-10`} />
      </div>
      <p className="text-sm font-medium text-neutral-300 tracking-wide">{message}</p>
      <p className="text-xs text-neutral-500 mt-1">Enforcing Row-Level Security & audit verification</p>
    </div>
  );
};

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-white/10 rounded-lg w-1/3" />
        <div className="h-4 bg-white/10 rounded-full w-16" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-white/5 rounded-md"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <div className="h-4 bg-white/10 rounded w-20" />
        <div className="h-7 bg-white/10 rounded-xl w-24" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default LoadingSpinner;
