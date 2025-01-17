// /components/product_registration/types.tsx
export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children: React.ReactNode;
  required?: boolean;
}

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "gradient" | "glass" | "outline" | "ghost";
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
