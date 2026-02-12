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
import { usePostCase } from "@api/usePostCase";
import type { CreateCaseRequest } from "@models/requests";

const mockLogger = {
  debug: vi.fn(),
  error: vi.fn(),
};
vi.mock("@/hooks/useLogger", () => ({
  useLogger: () => mockLogger,
}));

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

describe("usePostCase", () => {
  let queryClient: QueryClient;
  const originalConfig = window.config;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const requestBody: CreateCaseRequest = {
    deploymentId: "deploy-1",
    description: "Test case description",
    issueTypeKey: 1,
    productId: "product-1",
    projectId: "project-1",
    severityKey: 0,
    title: "Test case",
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

  it("throws when isMockEnabled is true", async () => {
    const { result } = renderHook(() => usePostCase(), { wrapper });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      "Create case is not available when mock is enabled. Disable mock to create a case.",
    );
  });

  it("posts to API and returns CreateCaseResponse when isMockEnabled is false", async () => {
    mockIsMockEnabled = false;
    const mockResponse = { id: "case-123" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      status: 200,
    } as Response);

    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => usePostCase(), { wrapper });

    const data = await result.current.mutateAsync(requestBody);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test/cases",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Object),
        body: JSON.stringify(requestBody),
      }),
    );
    expect(data).toEqual(mockResponse);
  });

  it("throws when CUSTOMER_PORTAL_BACKEND_BASE_URL is missing", async () => {
    mockIsMockEnabled = false;
    window.config = {} as typeof window.config;

    const { result } = renderHook(() => usePostCase(), { wrapper });

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
      text: () => Promise.resolve("Server error"),
    } as Response);

    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => usePostCase(), { wrapper });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      /Error creating case: 500/,
    );
  });

  it("throws when user is not signed in", async () => {
    mockIsMockEnabled = false;
    mockIsSignedIn = false;

    window.config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    } as typeof window.config;

    const { result } = renderHook(() => usePostCase(), { wrapper });

    await expect(result.current.mutateAsync(requestBody)).rejects.toThrow(
      "User must be signed in to create a case",
    );
  });
});
