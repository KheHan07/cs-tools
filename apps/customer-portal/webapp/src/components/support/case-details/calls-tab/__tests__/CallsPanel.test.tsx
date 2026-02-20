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

import type { ReactElement } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetCallRequests } from "@api/useGetCallRequests";
import CallsPanel from "@case-details-calls/CallsPanel";

vi.mock("@api/useGetCallRequests");
vi.mock("@api/usePostCallRequest", () => ({
  usePostCallRequest: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@api/usePatchCallRequest", () => ({
  usePatchCallRequest: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWithProviders(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const mockProjectId = "project-1";
const mockCaseId = "case-1";

describe("CallsPanel", () => {
  it("should render loading state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: true,
      data: undefined,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(screen.getByTestId("calls-list-skeleton")).toBeInTheDocument();
  });

  it("should render error state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(
      screen.getByText(/Error loading call requests/i),
    ).toBeInTheDocument();
  });

  it("should render call requests", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        callRequests: [
          {
            id: "call-1",
            case: { id: "case-1", label: "CS0438719" },
            reason: "Test notes",
            preferredTimes: ["2024-10-29 14:00:00"],
            durationMin: 60,
            scheduleTime: "2024-11-05 14:00:00",
            createdOn: "2024-10-29 10:00:00",
            updatedOn: "2024-10-29 10:00:00",
            state: { id: "1", label: "Pending on WSO2" },
          },
        ],
      },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(screen.getByText(/Call Request/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending on WSO2/i)).toBeInTheDocument();
    expect(screen.getByText(/Test notes/i)).toBeInTheDocument();
  });

  it("should render empty state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      data: { callRequests: [] },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(
      screen.getByText(/No call requests found for this case/i),
    ).toBeInTheDocument();
  });

  it("should open Request Call modal when button is clicked", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      data: { callRequests: [] },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);

    fireEvent.click(screen.getByRole("button", { name: /Request Call/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meeting Duration/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        /Any specific topics or questions you'd like to discuss/i,
      ),
    ).toBeInTheDocument();
  });
});
