'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />
  };

  const styles = {
    success: 'bg-brand-success/10 border-brand-success/30 text-brand-success',
    error: 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md',
        'min-w-[300px] max-w-md shadow-card',
        styles[type]
      )}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

