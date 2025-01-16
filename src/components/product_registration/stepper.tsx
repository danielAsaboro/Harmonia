// /components/product_registration/stepper.tsx
import React from "react";
import { Check } from "lucide-react";
import { useFormContext } from "./product-form-context";
import { cn } from "@/utils/ts-merge";

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
    <nav aria-label="Progress" className="w-full px-4 mb-8">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <li
              key={step.title}
              className={cn(
                "relative flex flex-col items-center",
                index !== steps.length - 1 &&
                  "after:absolute after:left-[50%] after:top-[20px] after:h-0.5 after:w-full after:translate-x-[20px] md:after:w-full",
                index < currentStep ? "after:bg-primary" : "after:bg-border"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200",
                    isActive && "border-primary bg-primary/10",
                    isCompleted && "border-primary bg-primary",
                    !isActive && !isCompleted && "border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="hidden text-xs text-muted-foreground md:block">
                    {step.description}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
