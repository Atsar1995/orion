export const colors = {
  primary: "#070d1a",
  secondary: "#050a14",
  accent: "#d4af37",
  accentLight: "#e2c158",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#60a5fa",
  background: "#070d1a",
  surface: "rgba(255, 255, 255, 0.03)",
  surfaceHover: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.07)",
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  text: "#f5f5f7",
  mutedText: "rgba(255, 255, 255, 0.45)",
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), monospace",
  },
  heading: {
    xl: { size: "1.875rem", lineHeight: "2.25rem", weight: "600" },
    lg: { size: "1.5rem", lineHeight: "2rem", weight: "600" },
    md: { size: "1.25rem", lineHeight: "1.75rem", weight: "500" },
    sm: { size: "1.125rem", lineHeight: "1.75rem", weight: "500" },
  },
  body: {
    md: { size: "0.875rem", lineHeight: "1.25rem", weight: "400" },
    sm: { size: "0.8125rem", lineHeight: "1.25rem", weight: "300" },
  },
  caption: {
    md: { size: "0.6875rem", lineHeight: "1rem", weight: "500" },
    sm: { size: "0.625rem", lineHeight: "0.875rem", weight: "500" },
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0",
    wide: "0.05em",
    wider: "0.14em",
    widest: "0.18em",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.625",
  },
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

export const borderRadius = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  pill: "9999px",
} as const;

export const shadows = {
  sm: "0 4px 16px rgba(0, 0, 0, 0.16)",
  md: "0 8px 32px rgba(0, 0, 0, 0.24)",
  lg: "0 12px 40px rgba(0, 0, 0, 0.32)",
  overlay: "0 8px 24px rgba(212, 175, 55, 0.25)",
} as const;

export const animation = {
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
} as const;

export const zIndex = {
  header: 20,
  sidebar: 30,
  dropdown: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export const cssVarNames = {
  color: {
    primary: "--orion-color-primary",
    secondary: "--orion-color-secondary",
    accent: "--orion-color-accent",
    accentLight: "--orion-color-accent-light",
    success: "--orion-color-success",
    warning: "--orion-color-warning",
    danger: "--orion-color-danger",
    info: "--orion-color-info",
    background: "--orion-color-background",
    surface: "--orion-color-surface",
    border: "--orion-color-border",
    text: "--orion-color-text",
    mutedText: "--orion-color-muted-text",
  },
  spacing: {
    1: "--orion-space-1",
    2: "--orion-space-2",
    3: "--orion-space-3",
    4: "--orion-space-4",
    6: "--orion-space-6",
    8: "--orion-space-8",
    10: "--orion-space-10",
    12: "--orion-space-12",
    16: "--orion-space-16",
  },
  radius: {
    sm: "--orion-radius-sm",
    md: "--orion-radius-md",
    lg: "--orion-radius-lg",
    xl: "--orion-radius-xl",
    pill: "--orion-radius-pill",
  },
  shadow: {
    sm: "--orion-shadow-sm",
    md: "--orion-shadow-md",
    lg: "--orion-shadow-lg",
    overlay: "--orion-shadow-overlay",
  },
  animation: {
    fast: "--orion-duration-fast",
    normal: "--orion-duration-normal",
    slow: "--orion-duration-slow",
  },
  zIndex: {
    header: "--orion-z-header",
    sidebar: "--orion-z-sidebar",
    dropdown: "--orion-z-dropdown",
    modal: "--orion-z-modal",
    toast: "--orion-z-toast",
    tooltip: "--orion-z-tooltip",
  },
} as const;

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
  cssVarNames,
} as const;
