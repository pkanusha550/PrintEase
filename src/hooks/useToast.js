import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = toastId++;
    const toast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 3000,
      autoClose: options.autoClose !== false,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, options) => showToast(message, 'success', options),
    [showToast]
  );
  const error = useCallback(
    (message, options) => showToast(message, 'error', options),
    [showToast]
  );
  const info = useCallback(
    (message, options) => showToast(message, 'info', options),
    [showToast]
  );
  const warning = useCallback(
    (message, options) => showToast(message, 'warning', options),
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}

