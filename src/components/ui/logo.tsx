
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Gradient logo icon */}
      <div className={cn(
        "rounded-lg bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-1.5 shadow-soft",
        iconSizes[size]
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
          <path d="M12 10v6m-3-3h6"/>
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold text-gray-900",
          textSizes[size]
        )}>
          SnapRestore
        </span>
      )}
    </div>
  );
}
