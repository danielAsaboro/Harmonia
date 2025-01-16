// /components/ui/input.tsx
import * as React from "react";
import { InputProps } from "../product_registration/types";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-10 w-full rounded-md border border-border 
          bg-background px-3 py-2 text-sm text-foreground
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-primary focus-visible:ring-offset-1
          disabled:cursor-not-allowed disabled:opacity-50
          invalid:border-red-500 invalid:ring-red-500
          aria-[invalid=true]:border-red-500
          transition-colors duration-200
          ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
