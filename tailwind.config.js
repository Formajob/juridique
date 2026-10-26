module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VDM / ACX Flow design tokens
        background: "#f6f7fb",
        foreground: "#18213b",
        card: "#ffffff",
        "card-foreground": "#18213b",
        primary: "#0b1330",
        "primary-foreground": "#ffffff",
        secondary: "#f6f7fb",
        "secondary-foreground": "#18213b",
        muted: "#62708a",
        "muted-foreground": "#62708a",
        accent: "#26d4ea",
        "accent-foreground": "#ffffff",
        border: "#e4e8f1",
        input: "#e4e8f1",
        ring: "#26d4ea",
        destructive: "#a03030",
        sidebar: "#0b1330",
        "sidebar-foreground": "#ffffff",

        // Flow custom palette
        "flow-navy": "#0b1330",
        "flow-navy-foreground": "#ffffff",
        "flow-navy-soft": "#192754",
        "flow-cyan": "#26d4ea",
        "flow-cyan-dark": "#0aa8bd",
        "flow-cyan-light": "#a0f0fc",
        "flow-cyan-hover": "#0aa8bd",
        "flow-muted": "#62708a",
        "flow-text": "#18213b",
        "flow-border": "#e4e8f1",
        "flow-background": "#f6f7fb",
        "flow-sidebar": "#0b1330",
        "flow-white": "#ffffff",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "6px",
      },
      boxShadow: {
        "flow-card": "0 4px 20px rgba(11,19,48,0.08),0 1px 3px rgba(11,19,48,0.04)",
        "flow-sm": "0 1px 3px rgba(11,19,48,0.06)",
      },
    },
  },
  plugins: [],
};