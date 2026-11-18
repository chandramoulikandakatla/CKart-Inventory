/**
 * Reusable Toast Notification Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { ToastData } from '../../components/common/ToastNotification';

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback(
    (title: string, message: string, type: 'success' | 'error' | 'info' | string = 'info') => {
      setToast({ title, message, type, id: Date.now() });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, setToast, showToast };
}
