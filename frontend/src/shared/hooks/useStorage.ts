export function useStorage<T>(key: string, initialValue: T) {
  const getValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage[${key}]:`, error);
      return initialValue;
    }
  };

  const setValue = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage[${key}]:`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage[${key}]:`, error);
    }
  };

  return { getValue, setValue, removeValue };
}
