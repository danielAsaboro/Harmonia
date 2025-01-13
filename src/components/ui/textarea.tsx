// textarea.tsx
import * as React from "react";
import { TextareaProps } from "../product_registration/types";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-border 
          bg-inputBg px-3 py-2 text-sm text-text 
          placeholder:text-secondaryText focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-primary 
          disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
