import { type BaseURLAuthClientConfig } from "@asgardeo/auth-react";

export const AsgardeoConfig: BaseURLAuthClientConfig = {
  scope: ["openid", "email", "groups"],
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  signInRedirectURL: import.meta.env.VITE_AUTH_SIGN_IN_REDIRECT_URL,
  signOutRedirectURL: import.meta.env.VITE_AUTH_SIGN_OUT_REDIRECT_URL,
};

// Backend base URL for API calls
export const BACKEND_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL;
