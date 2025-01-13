// form-navigation.tsx
import React from "react";
import { Button } from "../ui/button";
import { useFormContext } from "./product-form-context";

interface FormNavigationProps {
  onValidate: () => boolean;
  onSubmit?: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  onValidate,
  onSubmit,
}) => {
  const { currentStep, setCurrentStep, isSubmitting } = useFormContext();

  const handleNext = () => {
    if (onValidate()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const isFinalStep = currentStep === 4;

  return (
    <div className="flex justify-between mt-6 pt-4 border-t border-border">
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={currentStep === 0}
      >
        Previous
      </Button>

      <Button
        onClick={isFinalStep ? onSubmit : handleNext}
        disabled={isSubmitting}
      >
        {isFinalStep ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
      </Button>
    </div>
  );
};
