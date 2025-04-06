
import { toast as sonnerToast } from "sonner";

// Create a wrapper around sonner toast with standard methods
export const toast = {
  // Default toast
  ...sonnerToast,
  
  // Success toast
  success: (title: string, options?: any) => {
    return sonnerToast.success(title, {
      ...options,
      className: "bg-green-50",
    });
  },
  
  // Error toast
  error: (title: string, options?: any) => {
    return sonnerToast.error(title, {
      ...options,
      className: "bg-red-50",
    });
  },
  
  // Info toast
  info: (title: string, options?: any) => {
    return sonnerToast.info(title, {
      ...options,
      className: "bg-blue-50",
    });
  },
  
  // Warning toast
  warning: (title: string, options?: any) => {
    return sonnerToast.warning(title, {
      ...options,
      className: "bg-yellow-50",
    });
  }
};
