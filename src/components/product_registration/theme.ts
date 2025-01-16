// // theme.ts
// export const theme = {
//   colors: {
//     primary: "rgb(29, 155, 240)",
//     background: "#000000",
//     text: "#FFFFFF",
//     secondaryText: "rgb(113, 118, 123)",
//     border: "rgb(47, 51, 54)",
//     hover: "rgb(24, 24, 24)",
//     success: "rgb(0, 186, 124)",
//     error: "rgb(244, 33, 46)",
//     warning: "rgb(255, 212, 0)",
//     card: "rgb(22, 24, 28)",
//     inputBg: "rgb(32, 35, 39)",
//   },
//   transitions: {
//     default: "all 0.2s ease-in-out",
//   },
// } as const;

// export type ThemeColors = keyof typeof theme.colors;

// /theme.ts
export const theme = {
  colors: {
    primary: "#2563eb", // Bright blue
    secondary: "#10b981", // Emerald green
    background: "#f8fafc", // Light background
    text: "#1e293b", // Slate text
    secondaryText: "#64748b", // Secondary text
    border: "#e2e8f0", // Light border
    hover: "#dbeafe", // Light blue hover
    success: "#10b981", // Success green
    error: "#ef4444", // Error red
    warning: "#f59e0b", // Warning yellow
    card: "#ffffff", // Card background
    inputBg: "#f1f5f9", // Light input background
    gradient: {
      start: "#2563eb", // Blue start
      mid: "#3b82f6", // Blue mid
      end: "#10b981", // Green end
    },
    darkMode: {
      background: "#0f172a", // Dark background
      card: "#1e293b", // Dark card
      text: "#f1f5f9", // Dark mode text
      secondaryText: "#94a3b8", // Dark secondary text
      border: "#334155", // Dark border
      inputBg: "#1e293b", // Dark input background
    },
  },
  transitions: {
    default: "all 0.2s ease-in-out",
    slow: "all 0.3s ease-in-out",
    fast: "all 0.1s ease-in-out",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    default: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    default: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
} as const;

export type ThemeColors = keyof typeof theme.colors;
