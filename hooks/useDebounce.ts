import { useState, useEffect } from "react";

/**
 * Custom Hook to debounce a value after a delay.
 * @param value - The value to debounce.
 * @param delay - Delay in milliseconds before updating the debounced value.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
