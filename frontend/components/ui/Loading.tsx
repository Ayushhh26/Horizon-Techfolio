'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  fullScreen = false,
  text
}) => {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={cn(
          sizeStyles[size],
          'animate-spin text-brand-primary'
        )} 
      />
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content
interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-white/5 rounded',
            className
          )}
        />
      ))}
    </>
  );
};

