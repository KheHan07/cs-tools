import { createRoot } from "react-dom/client";
import { Routes } from "@generouted/react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { AsgardeoConfig } from "./utils/auth";
import { AuthProvider } from "@asgardeo/auth-react";
import AppAuthProvider from "./providers/AppAuthProvider";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <AuthProvider config={AsgardeoConfig}>
        <AppAuthProvider>
          <Routes />
        </AppAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
