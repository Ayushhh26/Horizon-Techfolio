'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-primary to-brand-teal-700 text-white hover:shadow-glow-teal hover:scale-105',
    secondary: 'bg-brand-secondary text-white hover:shadow-glow hover:scale-105',
    danger: 'bg-brand-danger text-white hover:bg-red-600 hover:scale-105',
    ghost: 'bg-transparent border border-brand-primary/50 text-brand-light hover:border-brand-primary hover:bg-brand-primary/10 hover:shadow-glow-teal'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </motion.button>
  );
};

