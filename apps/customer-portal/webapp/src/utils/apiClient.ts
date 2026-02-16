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

import { addApiHeaders } from "@utils/apiUtils";

// TODO: Remove redundant code by researching and creating test projects.

export interface ApiClientCallbacks {
  getToken: () => Promise<string>;
  signOut: () => Promise<void>;
  signInSilently?: () => Promise<unknown>;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let isSilentSignInRunning = false;
let silentSignInPromise: Promise<string> | null = null;
const NOT_AUTHENTICATED_CODE = "SPA-AUTH_CLIENT-VM-IV02";

/**
 * Returns true if the error indicates the user is no longer authenticated.
 *
 * @param {unknown} error - Caught error from getToken().
 * @returns {boolean} True if error means "user must be authenticated first".
 */
function isNotAuthenticatedError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const e = error as { code?: string; message?: string; name?: string };
    if (e.code === NOT_AUTHENTICATED_CODE) return true;
    if (
      typeof e.message === "string" &&
      e.message.toLowerCase().includes("must be authenticated")
    )
      return true;
    if (
      typeof e.name === "string" &&
      e.name.toLowerCase().includes("not authenticated")
    )
      return true;
  }
  return false;
}

/**
 * Performs an authenticated fetch with 401 retry.
 * On getToken() "user not authenticated": tries signInSilently to restore session,
 * then retries getToken. If recovery fails, signs out and throws.
 * On 401: refreshes the token (via getToken), retries once with the new token.
 * Deduplicates recovery when multiple requests hit "user not authenticated" at once.
 *
 * @param {string} url - Request URL.
 * @param {RequestInit} init - Fetch options (method, body, etc.).
 * @param {ApiClientCallbacks} callbacks - getToken, signOut, optional signInSilently.
 * @returns {Promise<Response>} The fetch response.
 */
export async function authenticatedFetch(
  url: string,
  init: RequestInit,
  callbacks: ApiClientCallbacks,
): Promise<Response> {
  const { getToken, signOut, signInSilently } = callbacks;

  const doFetch = async (token: string): Promise<Response> => {
    const headers = new Headers(init.headers);
    const authHeaders = addApiHeaders(token);
    for (const [headerName, headerValue] of Object.entries(authHeaders)) {
      headers.set(headerName, headerValue);
    }
    return fetch(url, { ...init, headers });
  };

  const tryRecoverSession = async (): Promise<string> => {
    if (!signInSilently) {
      await signOut();
      throw new Error("Session expired");
    }
    const restored = await signInSilently();
    if (!restored) {
      await signOut();
      throw new Error("Session expired");
    }
    try {
      return await getToken();
    } catch {
      await signOut();
      throw new Error("Session expired");
    }
  };

  let token: string;
  try {
    token = await getToken();
  } catch (error) {
    if (isNotAuthenticatedError(error) && signInSilently) {
      if (!isSilentSignInRunning) {
        isSilentSignInRunning = true;
        silentSignInPromise = tryRecoverSession()
          .then((t) => {
            isSilentSignInRunning = false;
            silentSignInPromise = null;
            return t;
          })
          .catch((err) => {
            isSilentSignInRunning = false;
            silentSignInPromise = null;
            throw err;
          });
      }
      try {
        token = await silentSignInPromise!;
      } catch {
        throw error;
      }
    } else if (isNotAuthenticatedError(error)) {
      await signOut();
      throw error;
    } else {
      throw error;
    }
  }
  let response = await doFetch(token);

  if (response.status === 401) {
    let newToken: string;
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = getToken()
        .then((t) => {
          isRefreshing = false;
          refreshPromise = null;
          return t;
        })
        .catch(async (err) => {
          isRefreshing = false;
          refreshPromise = null;
          await signOut();
          throw err;
        });
    }
    try {
      newToken = await refreshPromise!;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Token refresh failed", { cause: err });
    }
    response = await doFetch(newToken);
    if (response.status === 401) {
      await signOut();
      throw new Error("Unauthorized after token refresh");
    }
  }

  return response;
}
