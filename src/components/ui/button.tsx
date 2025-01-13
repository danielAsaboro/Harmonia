// button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ButtonProps } from "../product_registration/types";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const variants = {
      default:
        "bg-primary text-white hover:bg-primary/90 focus-visible:bg-primary/90",
      destructive: "bg-error text-white hover:bg-error/90",
      outline: "border border-border bg-background hover:bg-hover text-text",
      secondary: "bg-inputBg text-text hover:bg-hover",
      ghost: "hover:bg-hover text-text",
      link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <Comp
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium 
          transition-colors focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-primary focus-visible:ring-offset-2 
          disabled:pointer-events-none disabled:opacity-50
          ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
