import { jwtDecode } from "jwt-decode";

// Token Payload
interface TokenPayload {
  email?: string;
  name?: string;
  groups?: string[];
  given_name: string;
  family_name: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const ID_TOKEN_KEY = "idToken";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string): void =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const getIdToken = (): string | null =>
  localStorage.getItem(ID_TOKEN_KEY);
export const setIdToken = (token: string): void =>
  localStorage.setItem(ID_TOKEN_KEY, token);

// Global reference to the token refresh callback from Asgardeo
let refreshTokenCallback: (() => Promise<string>) | null = null;

/**
 * Allows the auth provider to register the token refresh function.
 * This enables the API client to refresh tokens without direct access to React context.
 */
export const setRefreshTokenCallback = (
  callback: () => Promise<string>
): void => {
  refreshTokenCallback = callback;
};

/**
 * Refreshes the ID token using Asgardeo's authentication context.
 * Returns the new token and updates localStorage.
 */
export const refreshToken = async (): Promise<string> => {
  if (!refreshTokenCallback) {
    console.error("Token refresh callback not registered");
    throw new Error("Token refresh not available");
  }

  try {
    console.log("Refreshing ID token...");
    const newToken = await refreshTokenCallback();

    if (!newToken) {
      throw new Error("Failed to obtain new token");
    }

    // Update token in localStorage
    setIdToken(newToken);
    console.log("Token refreshed successfully");

    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

/**
 * Decodes the ID token and extracts user information.
 */
export const decodeToken = (): TokenPayload | null => {
  try {
    const token = getIdToken();
    if (!token) return null;
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};