// /components/ui/form.tsx
import * as React from "react";
import { Label } from "./label";
import {
  FormItemProps,
  FormLabelProps,
  FormControlProps,
  FormDescriptionProps,
  FormMessageProps,
} from "../product_registration/types";

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`space-y-2 ${className}`} {...props} />
  )
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <Label
      ref={ref}
      className={`text-sm font-medium text-foreground ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </Label>
  )
);
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`mt-2 relative ${className}`} {...props} />
  )
);
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground mt-1 ${className}`}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(({ className, children, ...props }, ref) => {
  if (!children) return null;

  return (
    <p
      ref={ref}
      className={`text-sm font-medium text-red-500 mt-2 ${className}`}
      {...props}
      role="alert"
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";
