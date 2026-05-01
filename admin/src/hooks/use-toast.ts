import { toast, type ExternalToast } from 'sonner';
import * as React from 'react';

// Extend Sonner's ExternalToast type with additional properties
type SonnerToastProps = ExternalToast & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
};

// Custom hook with variant support
function useToast() {
  const showToast = React.useCallback((props: SonnerToastProps) => {
    const { title, description, variant, ...options } = props;
    
    // Map variant to Sonner's built-in methods
    const message = title?.toString() || '';
    const descriptionText = description?.toString();
    
    switch (variant) {
      case 'destructive':
        return toast.error(message, {
          description: descriptionText,
          ...options,
        });
      case 'success':
        return toast.success(message, {
          description: descriptionText,
          ...options,
        });
      case 'warning':
        return toast.warning(message, {
          description: descriptionText,
          ...options,
        });
      case 'info':
        return toast.info(message, {
          description: descriptionText,
          ...options,
        });
      default:
        return toast(message, {
          description: descriptionText,
          ...options,
        });
    }
  }, []);

  const dismiss = React.useCallback((toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    toast: showToast,
    dismiss,
    // Direct methods without variant parameter
    success: (message: string, options?: ExternalToast) => toast.success(message, options),
    error: (message: string, options?: ExternalToast) => toast.error(message, options),
    warning: (message: string, options?: ExternalToast) => toast.warning(message, options),
    info: (message: string, options?: ExternalToast) => toast.info(message, options),
    loading: (message: string, options?: ExternalToast) => toast.loading(message, options),
    promise: toast.promise,
    custom: toast.custom,
  };
}

// Export a toast function that supports variant
const customToast = (props: SonnerToastProps) => {
  const { title, description, variant, ...options } = props;
  const message = title?.toString() || '';
  const descriptionText = description?.toString();
  
  switch (variant) {
    case 'destructive':
      return toast.error(message, { description: descriptionText, ...options });
    case 'success':
      return toast.success(message, { description: descriptionText, ...options });
    case 'warning':
      return toast.warning(message, { description: descriptionText, ...options });
    case 'info':
      return toast.info(message, { description: descriptionText, ...options });
    default:
      return toast(message, { description: descriptionText, ...options });
  }
};

export { useToast, customToast as toast };