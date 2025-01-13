// form-step.tsx
import React from "react";
import { useFormContext } from "./product-form-context";

interface FormStepProps {
  stepIndex: number;
  children: React.ReactNode;
}

export const FormStep: React.FC<FormStepProps> = ({ stepIndex, children }) => {
  const { currentStep } = useFormContext();

  if (stepIndex !== currentStep) {
    return null;
  }

  return (
    <div className="animate-in fade-in duration-300 ease-in-out">
      {children}
    </div>
  );
};
