import { useState, useCallback } from 'react';
import Toast, { ToastMessage } from './Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    // Check for duplicate messages (same title and message)
    const isDuplicate = toasts.some(t => 
      t.title === toast.title && t.message === toast.message
    );
    
    if (isDuplicate) {
      return; // Skip duplicate toasts
    }
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, [toasts]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = useCallback(() => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  ), [toasts, dismissToast]);

  return {
    addToast,
    dismissToast,
    ToastContainer
  };
};