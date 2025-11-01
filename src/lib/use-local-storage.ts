import { useCallback, useEffect, useState } from "react";

const serialize = JSON.stringify;
const deserialize = JSON.parse;

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserialize(raw) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(() => readValue());

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (value: T) => {
      // Prevent build error "window is undefined" but keeps working
      if (typeof window === "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” outside browser env`,
        );
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(readValue()) : value;

        window.localStorage.setItem(key, serialize(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, readValue],
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [key, readValue]);

  useEffect(() => {
    const ac = new AbortController();
    window.addEventListener(
      "storage",
      (event) => (event.key === key ? setStoredValue(readValue()) : undefined),
      { signal: ac.signal },
    );
    return () => ac.abort();
  }, [key, readValue]);

  return [storedValue, setValue] as const;
}
