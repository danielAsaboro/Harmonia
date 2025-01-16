// /components/product_registration/form-step.tsx
import React from "react";
import { useFormContext } from "./product-form-context";
import { cn } from "@/utils/ts-merge";

interface FormStepProps {
  stepIndex: number;
  children: React.ReactNode;
  className?: string;
}

export const FormStep: React.FC<FormStepProps> = ({
  stepIndex,
  children,
  className,
}) => {
  const { currentStep } = useFormContext();

  if (stepIndex !== currentStep) {
    return null;
  }

  return (
    <div
      className={cn(
        "animate-in fade-in duration-500 slide-in-from-right",
        "data-[state=inactive]:animate-out data-[state=inactive]:slide-out-to-left",
        "relative space-y-4",
        className
      )}
      role="tabpanel"
      aria-label={`Step ${stepIndex + 1}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

// Utility component for step sections
export const FormStepSection: React.FC<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// Helper component for form fields layout
export const FormRow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
};

// Utility component for required field indicators
export const RequiredIndicator: React.FC = () => (
  <span
    className="text-red-500 ml-1"
    aria-hidden="true"
    title="This field is required"
  >
    *
  </span>
);
