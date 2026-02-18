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

import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import { usePostProductVulnerabilities } from "@api/usePostProductVulnerabilities";
import type { ProductVulnerabilitiesSearchRequest } from "@models/requests";

const mockLogger = {
  debug: vi.fn(),
  error: vi.fn(),
};
vi.mock("@/hooks/useLogger", () => ({
  useLogger: () => mockLogger,
}));

const mockAuthFetch = vi.fn();
vi.mock("@context/AuthApiContext", () => ({
  useAuthApiClient: () => mockAuthFetch,
}));

let mockIsSignedIn = true;
let mockIsAuthLoading = false;
vi.mock("@asgardeo/react", () => ({
  useAsgardeo: () => ({
    getIdToken: vi.fn().mockResolvedValue("mock-token"),
    isSignedIn: mockIsSignedIn,
    isLoading: mockIsAuthLoading,
  }),
}));

describe("usePostProductVulnerabilities", () => {
  let queryClient: QueryClient;
  const originalConfig = window.config;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const requestBody: ProductVulnerabilitiesSearchRequest = {
    filters: {
      searchQuery: "string",
      severityId: 0,
      statusId: 0,
    },
    pagination: { offset: 0, limit: 10 },
    sortBy: { field: "severity", order: "desc" },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    mockIsSignedIn = true;
    mockIsAuthLoading = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.config = originalConfig;
    vi.unstubAllGlobals();
  });

  it("posts to API and returns search response", async () => {
    const mockResponse = {
      productVulnerabilities: [
        {
          id: "abc",
          cveId: "CVE-2099-1234",
          vulnerabilityId: "XRAY-001",
          severity: { id: 1, label: "High" },
          componentName: "test",
          version: "1.0",
          type: "maven",
          useCase: "",
          justification: "",
          resolution: "",
        },
      ],
      totalRecords: 1,
      offset: 0,
      limit: 10,
    };

    mockAuthFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      status: 200,
    } as Response);
    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;

    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    const data = await result.current.mutateAsync(requestBody);

    expect(mockAuthFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/vulnerabilities/search"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
    expect(data).toEqual(mockResponse);
  });

  it("throws when CUSTOMER_PORTAL_BACKEND_BASE_URL is missing", async () => {
    window.config = {} as typeof window.config;

    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      "CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured",
    );
  });

  it("throws when API response is not ok", async () => {
    mockAuthFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
      status: 500,
      text: () => Promise.resolve(""),
    } as Response);
    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;

    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      "Error searching product vulnerabilities",
    );
  });

  it("throws when user is not signed in", async () => {
    mockIsSignedIn = false;

    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;

    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      "User must be signed in to search product vulnerabilities",
    );
  });
});
