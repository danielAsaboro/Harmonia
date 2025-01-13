// stepper.tsx
import React from "react";
import { Check } from "lucide-react";
import { useFormContext } from "./product-form-context";

const steps = [
  { title: "Basic Info", description: "Product details" },
  { title: "Description", description: "About your product" },
  { title: "Technical", description: "Development info" },
  { title: "Team", description: "Contact details" },
  { title: "Additional", description: "Extra information" },
];

export const Stepper: React.FC = () => {
  const { currentStep } = useFormContext();

  return (
    <div className="w-full px-4 mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center">
            <div className="relative flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                  ${
                    index <= currentStep
                      ? "border-primary bg-primary text-white"
                      : "border-border text-secondaryText"
                  }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-[2px] absolute left-8 top-4 -translate-y-1/2
                    ${index < currentStep ? "bg-primary" : "bg-border"}`}
                  style={{ width: "100%" }}
                />
              )}
            </div>
            <div className="mt-2 text-center">
              <div
                className={`text-sm font-medium ${
                  index <= currentStep ? "text-text" : "text-secondaryText"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-secondaryText">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
