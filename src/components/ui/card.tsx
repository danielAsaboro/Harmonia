import * as React from "react";
import { cn } from "@/utils/ts-merge";
import { LucideIcon } from "lucide-react";

export const CARD_VARIANTS = {
  default: "default",
  glass: "glass",
  flat: "flat",
  elevated: "elevated",
  minimal: "minimal",
} as const;

export type CardVariant = keyof typeof CARD_VARIANTS;

export const ICON_POSITIONS = {
  start: "start",
  end: "end",
  none: "none",
} as const;

export type IconPosition = keyof typeof ICON_POSITIONS;

interface BaseCardProps {
  variant?: CardVariant;
  icon?: LucideIcon;
  iconPosition?: IconPosition;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BaseCardProps {}

const variantStyles: Record<CardVariant, string> = {
  default: cn(
    "bg-white/5",
    "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    "hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)]",
    "backdrop-blur-sm",
    "border border-white/[0.05]",
    "dark:bg-zinc-900/50",
    "dark:border-white/[0.02]"
  ),
  glass: cn(
    "bg-white/10",
    "backdrop-blur-xl",
    "border border-white/[0.08]",
    "shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
    "hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)]",
    "dark:bg-zinc-900/30",
    "dark:border-white/[0.03]"
  ),
  flat: cn(
    "bg-zinc-50/50",
    "dark:bg-zinc-900/50",
    "border-none",
    "shadow-none"
  ),
  elevated: cn(
    "bg-gradient-to-b from-white/50 to-white/30",
    "dark:from-zinc-900/50 dark:to-zinc-900/30",
    "shadow-[0_10px_40px_rgba(0,0,0,0.06)]",
    "hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)]",
    "border border-white/[0.08]",
    "dark:border-white/[0.02]"
  ),
  minimal: cn(
    "bg-transparent",
    "border-none",
    "shadow-none",
    "hover:bg-zinc-50/50",
    "dark:hover:bg-zinc-900/30"
  ),
};

const CardIcon: React.FC<{ icon: LucideIcon; className?: string }> = ({
  icon: Icon,
  className,
}) => (
  <Icon
    className={cn(
      "w-5 h-5",
      "text-zinc-500",
      "transition-all duration-300",
      "group-hover:text-zinc-800 dark:group-hover:text-zinc-200",
      className
    )}
  />
);

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      icon: Icon,
      iconPosition = "none",
      isLoading,
      isDisabled,
      children,
      ...props
    },
    ref
  ) => {
    const cardContent = (
      <div className="flex flex-col relative">
        {Icon && iconPosition === "start" && (
          <CardIcon icon={Icon} className="mb-4" />
        )}
        {children}
        {Icon && iconPosition === "end" && (
          <CardIcon icon={Icon} className="mt-4" />
        )}

        {isLoading && (
          <div className="absolute inset-0 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
          </div>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          "transition-all duration-300 ease-out",
          "group",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/30",
          isDisabled && "opacity-50 pointer-events-none",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {cardContent}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-medium",
      "text-zinc-900 dark:text-zinc-100",
      "transition-colors duration-300",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm", "text-zinc-500 dark:text-zinc-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", "text-zinc-600 dark:text-zinc-300", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
