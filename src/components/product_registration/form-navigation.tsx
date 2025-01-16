// /components/product_registration/form-navigation.tsx
import React from "react";
import { Button } from "../ui/button";
import { useFormContext } from "./product-form-context";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button
        onClick={isFinalStep ? onSubmit : handleNext}
        disabled={isSubmitting}
        className="gap-2"
      >
        {isFinalStep ? (
          isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
