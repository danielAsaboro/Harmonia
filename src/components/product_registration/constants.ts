// constants.ts
export const PRODUCT_CATEGORIES = [
  "DeFi (Decentralized Finance)",
  "DePin (Decentralized Physical Infrastructure Networks)",
  "Gaming",
  "Consumer",
  "Payments",
  "DAO & State Networks",
  "Public Good",
  "Infrastructure",
] as const;

export const CHAPTERS = [
  "ABIA",
  "ABUJA",
  "AKWA-IBOM",
  "ENUGU",
  "KANO",
  "LAGOS",
  "CROSS RIVER",
  "EDO",
  "NASARAWA",
  "BORNO",
  "KWARA",
  "OYO",
  "ONDO",
  "JIGAWA",
  "IMO",
  "NIGER",
  "OSUN",
  "KADUNA",
  "ANAMBRA",
  "OGUN",
  "RIVERS",
  "DELTA",
  "PLATEAU",
] as const;

export const DEVELOPMENT_STAGES = [
  "Ideation",
  "MVP Ready (Beta State)",
  "Live on Test-net",
  "Live on Mainnet",
] as const;

export const FUNDING_OPTIONS = [
  "Superteam NG Grant",
  "Bootstrapping",
  "External Funding (Angel Investors, VC funding etc.)",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type Chapter = (typeof CHAPTERS)[number];
export type DevelopmentStage = (typeof DEVELOPMENT_STAGES)[number];
export type FundingOption = (typeof FUNDING_OPTIONS)[number];
