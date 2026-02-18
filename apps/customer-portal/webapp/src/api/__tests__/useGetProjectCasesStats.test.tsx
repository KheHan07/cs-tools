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
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetProjectCasesStats } from "@api/useGetProjectCasesStats";
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

const mockCasesStatsResponse = {
  totalCases: 50,
  activeCases: { workInProgress: 1, waitingOnClient: 2, waitingOnWso2: 3, total: 6 },
  outstandingCases: { medium: 1, high: 0, critical: 0, total: 1 },
  resolvedCases: { total: 44, currentMonth: 5 },
};

vi.mock("@asgardeo/react", () => ({
  useAsgardeo: () => ({
    getIdToken: vi.fn(),
    isSignedIn: true,
    isLoading: false,
  }),
}));

vi.mock("@context/AuthApiContext", () => ({
  useAuthApiClient: () =>
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCasesStatsResponse),
    }),
}));

describe("useGetProjectCasesStats", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockLogger.debug.mockClear();
    mockLogger.error.mockClear();
    (window as unknown as { config?: { CUSTOMER_PORTAL_BACKEND_BASE_URL?: string } }).config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    };
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return loading state initially", async () => {
    const { result } = renderHook(() => useGetProjectCasesStats("project-1"), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return data after fetching", async () => {
    const { result } = renderHook(() => useGetProjectCasesStats("project-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.totalCases).toBe(50);
    expect(result.current.data?.activeCases).toBeDefined();
    expect(result.current.data?.outstandingCases).toBeDefined();
    expect(result.current.data?.resolvedCases).toBeDefined();
  });

  it("should have correct query options", () => {
    renderHook(() => useGetProjectCasesStats("project-1"), {
      wrapper,
    });

    const query = queryClient.getQueryCache().findAll({
      queryKey: ["cases-stats", "project-1"],
    })[0];

    expect((query?.options as any).staleTime).toBe(5 * 60 * 1000);
    expect((query?.options as any).refetchOnWindowFocus).toBeUndefined();
  });

  it("should not fetch if id is missing", () => {
    const { result } = renderHook(() => useGetProjectCasesStats(""), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
  });
});
