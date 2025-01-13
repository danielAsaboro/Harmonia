// product-form-context.tsx
import React, { createContext, useContext, useState } from "react";
import { ProductFormData } from "./schemas";

interface FormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    productCategory: "",
    logo: null,
    oneLiner: "",
    problemSolution: "",
    coreFeatures: "",
    roadmap: "",
    socialMediaLinks: "",
    chapter: "",
    developmentStage: "ideation",
    githubRepo: "",
    liveLink: "",
    techStack: "",
    solanaIntegration: "",
    fundingStatus: [],
    challenges: "",
    contactInfo: {
      name: "",
      role: "",
      email: "",
      xHandle: "",
      telegramHandle: "",
    },
    additionalInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        errors,
        setErrors,
        isSubmitting,
        setIsSubmitting,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
