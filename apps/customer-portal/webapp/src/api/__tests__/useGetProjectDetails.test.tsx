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
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetProjectDetails from "@api/useGetProjectDetails";
import type { ReactNode } from "react";

const mockProjectDetail = {
  id: "1890347890",
  name: "WSO2 Con App",
  key: "CON2026",
  description: "Official conference management app",
  createdOn: "2025-07-17 09:06:14",
  type: "FREE",
  subscription: {
    startDate: "2025-07-01",
    endDate: "2026-07-01",
    supportTier: "ENTERPRISE",
  },
};

vi.mock("@asgardeo/react", () => ({
  useAsgardeo: () => ({
    getIdToken: vi.fn(),
    isSignedIn: true,
    isLoading: false,
  }),
}));

const mockAuthFetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes("invalid-id")) {
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: "Project with ID invalid-id not found",
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockProjectDetail),
  } as Response);
});
vi.mock("@context/AuthApiContext", () => ({
  useAuthApiClient: () => mockAuthFetch,
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

describe("useGetProjectDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { config?: { CUSTOMER_PORTAL_BACKEND_BASE_URL?: string } }).config = {
      CUSTOMER_PORTAL_BACKEND_BASE_URL: "https://api.test",
    };
  });

  it("should return project details for a valid project ID", async () => {
    const validProjectId = mockProjectDetail.id;

    const { result } = renderHook(() => useGetProjectDetails(validProjectId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const response = result.current.data;
    expect(response).toBeDefined();
    expect(response?.id).toBe(validProjectId);
    expect(response?.name).toBe(mockProjectDetail.name);
  });

  it("should error for an invalid project ID", async () => {
    const invalidProjectId = "invalid-id";

    const { result } = renderHook(
      () => useGetProjectDetails(invalidProjectId),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain(
      "Project with ID invalid-id not found",
    );
  });
});
