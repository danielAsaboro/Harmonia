// /types/landing.ts
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  value: number;
  label: string;
  icon: LucideIcon;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

export interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface IntegrationCardProps {
  platform: string;
  icon: LucideIcon;
  metrics: Array<{
    value: string;
    label: string;
  }>;
}

export interface FeatureHighlight {
  icon: LucideIcon;
  text: string;
}
