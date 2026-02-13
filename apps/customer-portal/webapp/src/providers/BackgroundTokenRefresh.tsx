// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { useAsgardeo } from "@asgardeo/react";
import { useEffect, type JSX } from "react";

// Interval in ms for background token refresh (4 minutes).
const TOKEN_REFRESH_INTERVAL_MS = 4 * 60 * 1000;

/**
 * Invisible component that periodically calls getIdToken() while the user is signed in.
 * This keeps the session alive and allows the Asgardeo SDK to refresh tokens in the background
 * so API calls do not fail with expired tokens when the user stays on the page.
 *
 * @returns {JSX.Element} Renders nothing (null).
 */
export function BackgroundTokenRefresh(): JSX.Element | null {
  const { getIdToken, isSignedIn, isLoading } = useAsgardeo();

  useEffect(() => {
    if (!isSignedIn || isLoading) return;

    const refreshToken = (): void => {
      getIdToken().catch(() => {
      });
    };

    const intervalId = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [getIdToken, isSignedIn, isLoading]);

  return null;
}
