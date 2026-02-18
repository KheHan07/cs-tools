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
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetProjects from "@api/useGetProjects";
import type { ReactNode } from "react";

const mockProjectsResponse = {
  projects: [
    { id: "1", name: "Project A", key: "PA", createdOn: "2025-01-01", description: "Desc A" },
    { id: "2", name: "Project B", key: "PB", createdOn: "2025-01-02", description: "Desc B" },
  ],
  totalRecords: 2,
  offset: 0,
  limit: 10,
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
      json: () => Promise.resolve(mockProjectsResponse),
    }),
}));

vi.mock("@/hooks/useLogger", () => ({
  useLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGetProjects", () => {
  beforeEach(() => {
    (window as unknown as { config?: { CUSTOMER_PORTAL_BACKEND_BASE_URL?: string } }).config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    };
  });

  afterEach(() => {
    delete (window as unknown as { config?: unknown }).config;
  });

  it("should return paginated projects from API", async () => {
    const { result } = renderHook(
      () => useGetProjects({ pagination: { offset: 0, limit: 2 } }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const response = result.current.data;
    expect(response).toBeDefined();
    expect(response?.projects).toHaveLength(2);
    expect(response?.totalRecords).toBe(2);
    expect(response?.projects[0].name).toBe("Project A");
    expect(response?.offset).toBe(0);
    expect(response?.limit).toBe(10);
  });

  it("should handle default pagination if none provided", async () => {
    const { result } = renderHook(() => useGetProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const response = result.current.data;
    expect(response?.offset).toBe(0);
    expect(response?.limit).toBe(10);
  });

  it("should request and receive data when fetchAll is true", async () => {
    const { result } = renderHook(() => useGetProjects(undefined, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const response = result.current.data;
    expect(response).toBeDefined();
    expect(response?.projects).toBeDefined();
  });
});
