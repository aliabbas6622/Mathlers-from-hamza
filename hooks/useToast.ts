'use client';

import { useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration ?? 5000 };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, newToast.duration);
    }

    return id;
  };

  const success = (message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration });
  };

  const error = (message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration });
  };

  const info = (message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration });
  };

  const warning = (message: string, duration?: number) => {
    return addToast({ type: 'warning', message, duration });
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    clearAll,
  };
}
