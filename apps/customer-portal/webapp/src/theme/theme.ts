import { createTheme } from "@mui/material/styles";

// Declare custom theme palette extensions
declare module "@mui/material/styles" {
  interface Palette {
    status: {
      warning: {
        background: string;
        border: string;
        text: string;
      };
      success: {
        background: string;
        border: string;
        text: string;
      };
      neutral: {
        background: string;
        border: string;
        text: string;
      };
    };
  }

  interface PaletteOptions {
    status?: {
      warning?: {
        background?: string;
        border?: string;
        text?: string;
      };
      success?: {
        background?: string;
        border?: string;
        text?: string;
      };
      neutral?: {
        background?: string;
        border?: string;
        text?: string;
      };
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#ea580c", // orange-600 - primary actions, links
      light: "#fed7aa", // orange-200 - hover borders
      dark: "#f97316", // orange-500 - notifications, announcements
      contrastText: "#fff",
    },
    secondary: {
      main: "#2563eb", // blue-600 - informational elements
      contrastText: "#fff",
    },
    grey: {
      50: "#f9fafb", // page backgrounds
      100: "#f4f4f5", // hover states, accents (note: using f4f4f5 as it's more common)
      200: "#e5e7eb", // borders (primary border color)
      500: "#6b7280", // secondary text
      600: "#4b5563", // secondary text, icons
      800: "#1f2937", // text
      900: "#111827", // primary text, headings
    },
    warning: {
      main: "#fef9c3", // yellow-100 - warning backgrounds
      light: "#fde047", // yellow-200 - warning borders
      dark: "#854d0e", // yellow-800 - warning text
    },
    success: {
      main: "#dcfce7", // green-100 - success backgrounds
      light: "#bbf7d0", // green-200 - success borders
      dark: "#166534", // green-800 - success text
    },
    background: {
      default: "#f9fafb", // gray-50
      paper: "#fff",
    },
    text: {
      primary: "#111827", // gray-900
      secondary: "#4b5563", // gray-600
    },
    // Custom status colors for badges
    status: {
      warning: {
        background: "#fef9c3", // yellow-100
        border: "#fde047", // yellow-200
        text: "#854d0e", // yellow-800
      },
      success: {
        background: "#dcfce7", // green-100
        border: "#bbf7d0", // green-200
        text: "#166534", // green-800
      },
      neutral: {
        background: "#f4f4f5", // gray-100
        border: "#e5e7eb", // gray-200
        text: "#1f2937", // gray-800
      },
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
