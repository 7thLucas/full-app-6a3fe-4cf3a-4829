/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  font: TFont;
  tagline?: string;
  dailyPostingTime?: string;
  maxProductsInCatalog?: number;
  enableAutoPosting?: boolean;
  postCaptionTemplate?: string;
  supportedPlatforms?: string[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "PostPilot",
  logoUrl: "",
  brandColor: {
    // Base
    background:        "#F9FAFB",
    foreground:        "#111827",
    // Card
    card:              "#ffffff",
    cardForeground:    "#111827",
    // Popover
    popover:           "#ffffff",
    popoverForeground: "#111827",
    // Primary
    primary:           "#4F46E5",
    primaryForeground: "#ffffff",
    // Secondary
    secondary:           "#EEF2FF",
    secondaryForeground: "#3730A3",
    // Muted
    muted:           "#F3F4F6",
    mutedForeground: "#6B7280",
    // Accent
    accent:           "#10B981",
    accentForeground: "#ffffff",
    // Destructive
    destructive:           "#F43F5E",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#E5E7EB",
    input:  "#E5E7EB",
    ring:   "#4F46E5",
    // Charts
    chart1: "#4F46E5",
    chart2: "#10B981",
    chart3: "#F59E0B",
    chart4: "#F43F5E",
    chart5: "#8B5CF6",
    // Navbar
    navbarBackground: "#ffffff",
    // Sidebar
    sidebarBackground:        "#ffffff",
    sidebarForeground:        "#374151",
    sidebarPrimary:           "#4F46E5",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#EEF2FF",
    sidebarAccentForeground:  "#4F46E5",
    sidebarBorder:            "#E5E7EB",
    sidebarRing:              "#4F46E5",
  },
  font: {
    headingFont: "Plus Jakarta Sans",
    textFont: "Inter",
  },
  tagline: "Automate your product promotions. One post a day, every platform, zero effort.",
  dailyPostingTime: "09:00",
  maxProductsInCatalog: 100,
  enableAutoPosting: true,
  postCaptionTemplate: "Check out {name}! {description} — Only {price}. Shop now: {link}",
  supportedPlatforms: ["Instagram", "Facebook", "Twitter/X", "TikTok", "Pinterest", "LinkedIn"],
};
