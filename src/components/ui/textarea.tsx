// /components/ui/textarea.tsx
import * as React from "react";
import { TextareaProps } from "../product_registration/types";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`
          flex min-h-[80px] w-full rounded-md border border-border 
          bg-background px-3 py-2 text-sm text-foreground
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-primary focus-visible:ring-offset-1
          disabled:cursor-not-allowed disabled:opacity-50
          invalid:border-red-500 invalid:ring-red-500
          aria-[invalid=true]:border-red-500
          resize-vertical
          transition-colors duration-200
          ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
