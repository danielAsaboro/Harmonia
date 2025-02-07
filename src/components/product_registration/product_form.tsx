// product_form.tsx
import React from "react";
import { FormProvider, useFormContext } from "./product-form-context";
import { Stepper } from "./stepper";
import { FormStep } from "./form-step";
import { FormNavigation } from "./form-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormItem,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRODUCT_CATEGORIES,
  CHAPTERS,
  DEVELOPMENT_STAGES,
  FUNDING_OPTIONS,
} from "./constants";

const BasicInfoStep = () => {
  const { formData, setFormData, errors } = useFormContext();

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel required>Product Name</FormLabel>
        <FormControl>
          <Input
            name="productName"
            value={formData.productName}
            onChange={(e) =>
              setFormData({ ...formData, productName: e.target.value })
            }
            placeholder="Enter your product name"
          />
        </FormControl>
        {errors.productName && <FormMessage>{errors.productName}</FormMessage>}
      </FormItem>

      <FormItem>
        <FormLabel required>Product Category</FormLabel>
        <Select
          value={formData.productCategory}
          onValueChange={(value) =>
            setFormData({ ...formData, productCategory: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>

      <FormItem>
        <FormLabel required>Logo</FormLabel>
        <FormControl>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, logo: e.target.files?.[0] || null })
            }
          />
        </FormControl>
      </FormItem>
    </div>
  );
};

const DescriptionStep = () => {
  const { formData, setFormData, errors } = useFormContext();

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel required>One Liner</FormLabel>
        <FormDescription>A brief description of your product</FormDescription>
        <FormControl>
          <Input
            name="oneLiner"
            value={formData.oneLiner}
            onChange={(e) =>
              setFormData({ ...formData, oneLiner: e.target.value })
            }
            placeholder="Enter a brief description"
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel required>Problem x Solution</FormLabel>
        <FormControl>
          <Textarea
            name="problemSolution"
            value={formData.problemSolution}
            onChange={(e) =>
              setFormData({ ...formData, problemSolution: e.target.value })
            }
            placeholder="Describe the problem you're solving and your solution"
            className="min-h-32"
          />
        </FormControl>
      </FormItem>
    </div>
  );
};

const TechnicalStep = () => {
  const { formData, setFormData } = useFormContext();

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel required>Core Features</FormLabel>
        <FormControl>
          <Textarea
            name="coreFeatures"
            value={formData.coreFeatures}
            onChange={(e) =>
              setFormData({ ...formData, coreFeatures: e.target.value })
            }
            placeholder="List your product's core features"
            className="min-h-32"
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel required>Development Stage</FormLabel>
        <RadioGroup
          value={formData.developmentStage}
          onValueChange={(value) =>
            setFormData({ ...formData, developmentStage: value })
          }
        >
          {DEVELOPMENT_STAGES.map((stage) => (
            <div key={stage} className="flex items-center space-x-2">
              <RadioGroupItem
                value={stage.toLowerCase()}
                id={stage.toLowerCase()}
              />
              <Label htmlFor={stage.toLowerCase()}>{stage}</Label>
            </div>
          ))}
        </RadioGroup>
      </FormItem>

      <FormItem>
        <FormLabel>Tech Stack</FormLabel>
        <FormControl>
          <Textarea
            name="techStack"
            value={formData.techStack}
            onChange={(e) =>
              setFormData({ ...formData, techStack: e.target.value })
            }
            placeholder="Describe your technology stack"
          />
        </FormControl>
      </FormItem>
    </div>
  );
};

const TeamStep = () => {
  const { formData, setFormData } = useFormContext();

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel required>Chapter</FormLabel>
        <Select
          value={formData.chapter}
          onValueChange={(value) =>
            setFormData({ ...formData, chapter: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your chapter" />
          </SelectTrigger>
          <SelectContent>
            {CHAPTERS.map((chapter) => (
              <SelectItem key={chapter} value={chapter.toLowerCase()}>
                {chapter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>

      <FormItem>
        <FormLabel required>Contact Information</FormLabel>
        <div className="space-y-4">
          <Input
            name="contactInfo.name"
            value={formData.contactInfo.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, name: e.target.value },
              })
            }
            placeholder="Name"
          />
          <Input
            name="contactInfo.role"
            value={formData.contactInfo.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, role: e.target.value },
              })
            }
            placeholder="Role"
          />
          <Input
            name="contactInfo.email"
            type="email"
            value={formData.contactInfo.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, email: e.target.value },
              })
            }
            placeholder="Email address"
          />
        </div>
      </FormItem>
    </div>
  );
};

const AdditionalStep = () => {
  const { formData, setFormData } = useFormContext();

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel required>Funding Status</FormLabel>
        <FormDescription>
          How are you funding your product&apos;s progress?
        </FormDescription>
        <div className="space-y-4">
          {FUNDING_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option.toLowerCase()}
                checked={formData.fundingStatus.includes(option)}
                onCheckedChange={(checked) => {
                  const updatedFunding = checked
                    ? [...formData.fundingStatus, option]
                    : formData.fundingStatus.filter((item) => item !== option);
                  setFormData({ ...formData, fundingStatus: updatedFunding });
                }}
              />
              <Label htmlFor={option.toLowerCase()}>{option}</Label>
            </div>
          ))}
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Additional Information</FormLabel>
        <FormControl>
          <Textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={(e) =>
              setFormData({ ...formData, additionalInfo: e.target.value })
            }
            placeholder="Any additional information you'd like to share"
          />
        </FormControl>
      </FormItem>
    </div>
  );
};

const ProductDirectoryForm = () => {
  const handleValidation = () => {
    // Add validation logic here
    return true;
  };

  const handleSubmit = async () => {
    // Add submission logic here
  };

  return (
    <FormProvider>
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Product Guild Directory
            </CardTitle>
            <CardDescription className="text-center">
              Track SuperteamNG products and showcase your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper />
            <FormStep stepIndex={0}>
              <BasicInfoStep />
            </FormStep>
            <FormStep stepIndex={1}>
              <DescriptionStep />
            </FormStep>
            <FormStep stepIndex={2}>
              <TechnicalStep />
            </FormStep>
            <FormStep stepIndex={3}>
              <TeamStep />
            </FormStep>
            <FormStep stepIndex={4}>
              <AdditionalStep />
            </FormStep>
            <FormNavigation
              onValidate={handleValidation}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
};

export default ProductDirectoryForm;
