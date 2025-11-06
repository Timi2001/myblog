'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ data, onSave, delay = 30000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const saveData = useCallback(async () => {
    if (isSavingRef.current) return;
    
    const currentData = JSON.stringify(data);
    if (currentData === lastSavedRef.current) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = currentData;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave]);

  const scheduleAutoSave = useCallback(() => {
    if (!enabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveData();
    }, delay);
  }, [saveData, delay, enabled]);

  useEffect(() => {
    scheduleAutoSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleAutoSave]);

  // Manual save function
  const save = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return saveData();
  }, [saveData]);

  return { save };
}