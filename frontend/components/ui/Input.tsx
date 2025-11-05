'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, type, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = props.value || props.defaultValue;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="relative w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg',
              'text-brand-light placeholder-transparent',
              'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              (rightIcon || type === 'password') && 'pr-10',
              error && 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/50',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=" "
            {...props}
          />
          
          {label && (
            <label
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none',
                isFocused || hasValue
                  ? '-top-2 text-xs bg-brand-dark px-1'
                  : 'top-1/2 -translate-y-1/2 text-base',
                isFocused
                  ? 'text-brand-primary'
                  : error
                  ? 'text-brand-danger'
                  : 'text-gray-400',
                leftIcon && (isFocused || hasValue) ? 'left-9' : leftIcon ? 'left-10' : ''
              )}
            >
              {label}
            </label>
          )}

          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-light transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {rightIcon && type !== 'password' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-brand-danger animate-slide-down">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

