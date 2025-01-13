// schemas.ts
export interface ProductFormData {
  productName: string;
  productCategory: string;
  logo: File | null;
  oneLiner: string;
  problemSolution: string;
  coreFeatures: string;
  roadmap: string;
  socialMediaLinks: string;
  chapter: string;
  developmentStage: string;
  githubRepo: string;
  liveLink?: string;
  techStack: string;
  solanaIntegration: string;
  fundingStatus: string[];
  challenges: string;
  contactInfo: {
    name: string;
    role: string;
    email: string;
    xHandle: string;
    telegramHandle: string;
  };
  additionalInfo?: string;
}
