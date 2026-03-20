import { useState, useEffect, useCallback } from 'react';

export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable
    }
  }, [key, value]);

  // Wrap setValue to handle functional updaters and force re-render
  const setValuePersisted = useCallback((updater) => {
    setValue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Force a new object reference so useEffect fires
      return Array.isArray(next) ? [...next] : (next && typeof next === 'object' ? { ...next } : next);
    });
  }, []);

  return [value, setValuePersisted];
}
