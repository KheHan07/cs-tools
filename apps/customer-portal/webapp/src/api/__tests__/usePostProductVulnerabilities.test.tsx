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

vi.mock("@/constants/apiConstants", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    API_MOCK_DELAY: 0,
  };
});

const mockGetIdToken = vi.fn().mockResolvedValue("mock-token");
let mockIsSignedIn = true;
let mockIsAuthLoading = false;
vi.mock("@asgardeo/react", () => ({
  useAsgardeo: () => ({
    getIdToken: mockGetIdToken,
    isSignedIn: mockIsSignedIn,
    isLoading: mockIsAuthLoading,
  }),
}));

let mockIsMockEnabled = true;
vi.mock("@/providers/MockConfigProvider", () => ({
  useMockConfig: () => ({
    isMockEnabled: mockIsMockEnabled,
  }),
}));

// Use global fetch so tests can stub it (same pattern as usePostCaseClassifications, usePostAttachments).
vi.mock("@/context/AuthApiContext", () => ({
  useAuthApiClient: () => (url: string, init?: RequestInit) => fetch(url, init),
  AuthApiProvider: ({ children }: { children: unknown }) => children,
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
    mockIsMockEnabled = true;
    mockIsSignedIn = true;
    mockIsAuthLoading = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.config = originalConfig;
    vi.unstubAllGlobals();
  });

  it("returns mock data when isMockEnabled is true", async () => {
    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    const data = await result.current.mutateAsync(requestBody);

    expect(data.productVulnerabilities).toHaveLength(3);
    expect(data.totalRecords).toBe(3);
    expect(data.offset).toBe(0);
    expect(data.limit).toBe(10);
    expect(data.productVulnerabilities[0].cveId).toBe("CVE-2099-5555");
    expect(data.productVulnerabilities[0].severity.label).toBe("High");
  });

  it("posts to API when isMockEnabled is false", async () => {
    mockIsMockEnabled = false;
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

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      status: 200,
    } as Response);

    vi.stubGlobal("fetch", mockFetch);
    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;

    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    const data = await result.current.mutateAsync(requestBody);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/vulnerabilities/search"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
    expect(data).toEqual(mockResponse);
  });

  it("throws when CUSTOMER_PORTAL_BACKEND_BASE_URL is missing", async () => {
    mockIsMockEnabled = false;
    window.config = {} as typeof window.config;

    const { result } = renderHook(() => usePostProductVulnerabilities(), {
      wrapper,
    });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      "CUSTOMER_PORTAL_BACKEND_BASE_URL is not configured",
    );
  });

  it("throws when API response is not ok", async () => {
    mockIsMockEnabled = false;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
      status: 500,
      text: () => Promise.resolve(""),
    } as Response);

    vi.stubGlobal("fetch", mockFetch);
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
    mockIsMockEnabled = false;
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
