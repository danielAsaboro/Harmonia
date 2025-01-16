// /components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-primary/20",
        secondary: "bg-secondary/10 text-secondary ring-secondary/20",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        destructive: "bg-red-50 text-red-700 ring-red-600/20",
        outline: "text-foreground bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge, badgeVariants };
