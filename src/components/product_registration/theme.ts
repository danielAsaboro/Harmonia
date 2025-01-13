// theme.ts
export const theme = {
  colors: {
    primary: "rgb(29, 155, 240)",
    background: "#000000",
    text: "#FFFFFF",
    secondaryText: "rgb(113, 118, 123)",
    border: "rgb(47, 51, 54)",
    hover: "rgb(24, 24, 24)",
    success: "rgb(0, 186, 124)",
    error: "rgb(244, 33, 46)",
    warning: "rgb(255, 212, 0)",
    card: "rgb(22, 24, 28)",
    inputBg: "rgb(32, 35, 39)",
  },
  transitions: {
    default: "all 0.2s ease-in-out",
  },
} as const;

export type ThemeColors = keyof typeof theme.colors;
