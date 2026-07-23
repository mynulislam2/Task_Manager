type ToastFn = (message: string, type: 'success' | 'error' | 'info') => void;

let showToastFn: ToastFn | null = null;

export const registerToast = (fn: ToastFn) => {
  showToastFn = fn;
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  showToastFn?.(message, type);
};
