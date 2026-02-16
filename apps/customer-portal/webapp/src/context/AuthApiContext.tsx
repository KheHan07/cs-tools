// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type JSX,
  type ReactNode,
} from "react";
import { useAsgardeo } from "@asgardeo/react";
import {
  authenticatedFetch,
  type ApiClientCallbacks,
} from "@utils/apiClient";

/** Function to perform an authenticated fetch with 401 retry. */
export type AuthenticatedFetchFn = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

const AuthApiContext = createContext<AuthenticatedFetchFn | null>(null);

interface AuthApiProviderProps {
  children: ReactNode;
}

/**
 * Provides an authenticated fetch function to children.
 * Uses getIdToken and signOut from Asgardeo; handles 401 with refresh and retry.
 * Must be used inside AsgardeoProvider.
 *
 * @param {AuthApiProviderProps} props - children.
 * @returns {JSX.Element} Context provider.
 */
export function AuthApiProvider({ children }: AuthApiProviderProps): JSX.Element {
  const { getIdToken, signOut, signInSilently } = useAsgardeo();

  const getToken = useCallback(() => getIdToken(), [getIdToken]);
  const signOutFn = useCallback(async () => {
    await signOut();
  }, [signOut]);
  const signInSilentlyFn = useCallback(() => signInSilently(), [signInSilently]);

  const fetchFn = useMemo<AuthenticatedFetchFn>(() => {
    const callbacks: ApiClientCallbacks = {
      getToken,
      signOut: signOutFn,
      signInSilently: signInSilentlyFn,
    };
    return (url: string, init?: RequestInit) =>
      authenticatedFetch(url, init ?? {}, callbacks);
  }, [getToken, signOutFn, signInSilentlyFn]);

  return (
    <AuthApiContext.Provider value={fetchFn}>{children}</AuthApiContext.Provider>
  );
}

/**
 * Returns the authenticated fetch function. Must be used within AuthApiProvider.
 *
 * @returns {AuthenticatedFetchFn} Authenticated fetch with 401 retry.
 */
export function useAuthApiClient(): AuthenticatedFetchFn {
  const ctx = useContext(AuthApiContext);
  if (!ctx) {
    throw new Error("useAuthApiClient must be used within AuthApiProvider");
  }
  return ctx;
}
