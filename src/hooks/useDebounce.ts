import { useEffect, useState } from "react";

interface Props {
  value: string;
  delay?: number;
}

export const useDebounce = ({ value, delay = 400 }: Props) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return debouncedValue;
};
