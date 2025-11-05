'use client';

import { create } from 'zustand';
import type { ToastProps } from '@/components/ui/Toast';

interface ToastStore {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));

export const useToast = () => {
  const { addToast } = useToastStore();
  
  return {
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => 
      addToast({ type, message }),
    success: (message: string) => addToast({ type: 'success', message }),
    error: (message: string) => addToast({ type: 'error', message }),
    info: (message: string) => addToast({ type: 'info', message }),
    warning: (message: string) => addToast({ type: 'warning', message })
  };
};

