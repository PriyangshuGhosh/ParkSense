/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // ParkSense Login Colors
        'parksense-border': 'hsl(var(--parksense-border))',
        'parksense-title': 'hsl(var(--parksense-title))',
        'parksense-gray': 'hsl(var(--parksense-gray))',
        'parksense-button': 'hsl(var(--parksense-button))',
        
        // GITAM Dashboard Colors
        'gitam-green': 'hsl(var(--gitam-green))',
        'gitam-gray': 'hsl(var(--gitam-gray))',
        'dashboard-gray': 'hsl(var(--dashboard-gray))',
        'profile-gray': 'hsl(var(--profile-gray))',
        
        // Parking Spot Colors - Dashboard
        'spot-red': 'hsl(var(--spot-red))',
        'spot-blue': 'hsl(var(--spot-blue))',
        'spot-gold': 'hsl(var(--spot-gold))',
        'spot-purple': 'hsl(var(--spot-purple))',
        'spot-teal': 'hsl(var(--spot-teal))',
        'spot-green': 'hsl(var(--spot-green))',
        'spot-placeholder': 'hsl(var(--spot-placeholder))',
        
        // Parking Spot Colors - Booking Page
        'spot-ict': 'hsl(var(--spot-ict))',
        'spot-krc': 'hsl(var(--spot-krc))',
        'spot-gimsr': 'hsl(var(--spot-gimsr))',
        'spot-cb': 'hsl(var(--spot-cb))',
        'spot-vb': 'hsl(var(--spot-vb))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'instrument': ['Instrument Sans', 'sans-serif'],
        'karma': ['Karma', 'serif'],
      },
    },
  },
  plugins: [],
}