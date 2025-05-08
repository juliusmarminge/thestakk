import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 500, // This is the wait time, not the function
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounceMs?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  // Sync with initialValue when it changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Define the debounced function with useCallback
  const debouncedOnChange = useDebouncedCallback(
    (newValue: string | number) => {
      onChange(newValue);
    },
    { wait: debounceMs },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue); // Update local state immediately
    debouncedOnChange(newValue); // Call debounced version
  };

  return <Input {...props} value={value} onChange={handleChange} />;
}
