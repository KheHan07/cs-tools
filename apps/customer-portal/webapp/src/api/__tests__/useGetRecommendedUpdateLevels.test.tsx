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

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGetRecommendedUpdateLevels } from "@api/useGetRecommendedUpdateLevels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock logger
const mockLogger = {
  debug: vi.fn(),
  error: vi.fn(),
};
vi.mock("@/hooks/useLogger", () => ({
  useLogger: () => mockLogger,
}));

vi.mock("@/constants/apiConstants", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    API_MOCK_DELAY: 0,
  };
});

// Mock @asgardeo/react
const mockGetIdToken = vi.fn().mockResolvedValue("mock-token");
vi.mock("@asgardeo/react", () => ({
  useAsgardeo: () => ({
    getIdToken: mockGetIdToken,
    isSignedIn: true,
    isLoading: false,
  }),
}));

// Mock MockConfigProvider
let mockIsMockEnabled = true;
vi.mock("@/providers/MockConfigProvider", () => ({
  useMockConfig: () => ({
    isMockEnabled: mockIsMockEnabled,
  }),
}));

// Mock AuthApiContext - directly mock the hook useAuthApiClient
const mockFetchFn = vi.fn();
vi.mock("@/context/AuthApiContext", () => ({
  useAuthApiClient: () => mockFetchFn,
}));

describe("useGetRecommendedUpdateLevels", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
      },
    });
    mockLogger.debug.mockClear();
    mockLogger.error.mockClear();
    mockIsMockEnabled = true;
    mockFetchFn.mockReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return loading state initially", async () => {
    const { result } = renderHook(() => useGetRecommendedUpdateLevels(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return mock data when mock is enabled", async () => {
    mockIsMockEnabled = true;
    const { result } = renderHook(() => useGetRecommendedUpdateLevels(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 10000,
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining("Fetching recommended update levels, mock: true"),
    );
  }, 15000);

  it("should have correct query options", () => {
    renderHook(() => useGetRecommendedUpdateLevels(), {
      wrapper,
    });

    const query = queryClient.getQueryCache().findAll({
      queryKey: ["recommended-update-levels", true],
    })[0];

    expect((query?.options as any).staleTime).toBe(5 * 60 * 1000);
  });

  it("should fetch real data when mock is disabled", async () => {
    mockIsMockEnabled = false;
    const mockResponse = [
      {
        productName: "wso2am-analytics",
        productBaseVersion: "2.6.0",
        channel: "full",
        startingUpdateLevel: 0,
        endingUpdateLevel: 33,
        installedUpdatesCount: 44,
        installedSecurityUpdatesCount: 23,
        timestamp: 1684415113845,
        recommendedUpdateLevel: 33,
        availableUpdatesCount: 0,
        availableSecurityUpdatesCount: 0,
      },
    ];

    const originalConfig = (window as any).config;
    (window as any).config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    };

    mockFetchFn.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      status: 200,
    } as Response);

    const { result } = renderHook(() => useGetRecommendedUpdateLevels(), {
      wrapper,
    });

    try {
      await waitFor(
        () => {
          if (result.current.isError) {
            throw new Error(`Hook error: ${result.current.error?.message}`);
          }
          return expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 10000 },
      );

      expect(result.current.data).toEqual(mockResponse);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(
          "Fetching recommended update levels, mock: false",
        ),
      );
    } finally {
      (window as any).config = originalConfig;
    }
  }, 15000);

  it("should handle API error when mock is disabled", async () => {
    mockIsMockEnabled = false;
    const originalConfig = (window as any).config;
    (window as any).config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    };

    mockFetchFn.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
      status: 500,
    } as Response);

    const { result } = renderHook(() => useGetRecommendedUpdateLevels(), {
      wrapper,
    });

    try {
      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 10000,
      });
      expect(result.current.error?.message).toContain(
        "Error fetching recommended update levels: Internal Server Error",
      );
      expect(mockLogger.error).toHaveBeenCalled();
    } finally {
      (window as any).config = originalConfig;
    }
  }, 15000);
});
