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

/** Callbacks for token refresh and sign-out. */
export interface ApiClientCallbacks {
  getToken: () => Promise<string>;
  signOut: () => Promise<void>;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * Performs an authenticated fetch with 401 retry.
 * On 401: refreshes the token (via getToken), retries once with the new token.
 * If refresh or retry fails, calls signOut and throws.
 * Deduplicates refresh when multiple requests get 401 at once.
 *
 * @param {string} url - Request URL.
 * @param {RequestInit} init - Fetch options (method, body, etc.).
 * @param {ApiClientCallbacks} callbacks - getToken and signOut callbacks.
 * @returns {Promise<Response>} The fetch response.
 */
export async function authenticatedFetch(
  url: string,
  init: RequestInit,
  callbacks: ApiClientCallbacks,
): Promise<Response> {
  const { getToken, signOut } = callbacks;

  const doFetch = async (token: string): Promise<Response> => {
    const headers = new Headers(init.headers);
    const authHeaders = addApiHeaders(token);
    Object.entries(authHeaders).forEach(([k, v]) => headers.set(k, v));
    return fetch(url, { ...init, headers });
  };

  const token = await getToken();
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
        .catch((err) => {
          isRefreshing = false;
          refreshPromise = null;
          signOut();
          throw err;
        });
    }
    try {
      newToken = await refreshPromise!;
    } catch {
      throw new Error("Token refresh failed");
    }
    response = await doFetch(newToken);
    if (response.status === 401) {
      await signOut();
      throw new Error("Unauthorized after token refresh");
    }
  }

  return response;
}
