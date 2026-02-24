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
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetCallRequests } from "@api/useGetCallRequests";
import { CALL_REQUEST_STATE_CANCELLED } from "@constants/supportConstants";
import CallsPanel from "@case-details-calls/CallsPanel";

vi.mock("@api/useGetCallRequests");
vi.mock("@api/usePostCallRequest", () => ({
  usePostCallRequest: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const mockPatchMutate = vi.fn();
vi.mock("@api/usePatchCallRequest", () => ({
  usePatchCallRequest: () => ({
    mutate: mockPatchMutate,
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
  beforeEach(() => {
    mockPatchMutate.mockClear();
  });

  it("should render loading state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: true,
      data: undefined,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
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
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
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
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      data: {
        pages: [
          {
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
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      data: { pages: [{ callRequests: [] }] },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(
      screen.getByText(/No call requests found for this case/i),
    ).toBeInTheDocument();
  });

  it("should show delete confirmation modal and call patch on confirm with reason", () => {
    const mockCall = {
      id: "call-1",
      case: { id: "case-1", label: "CS0438719" },
      reason: "Test notes",
      preferredTimes: ["2024-10-29 14:00:00"],
      durationMin: 60,
      scheduleTime: "2024-11-05 14:00:00",
      createdOn: "2024-10-29 10:00:00",
      updatedOn: "2024-10-29 10:00:00",
      state: { id: "1", label: "Pending on WSO2" },
    };
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      data: {
        pages: [{ callRequests: [mockCall] }],
      },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(screen.getByText(/Are you sure you want to cancel/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go Back/i })).toBeInTheDocument();
    const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn).toBeDisabled();

    const reasonInput = screen.getByLabelText(/Reason \*/i);
    fireEvent.change(reasonInput, { target: { value: "No longer needed" } });

    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    expect(mockPatchMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        callRequestId: "call-1",
        reason: "No longer needed",
        stateKey: CALL_REQUEST_STATE_CANCELLED,
      }),
      expect.any(Object),
    );
  });

  it("should show Load more and call fetchNextPage when clicked", () => {
    const mockFetchNextPage = vi.fn();
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      data: {
        pages: [
          {
            callRequests: [
              {
                id: "call-1",
                case: { id: "case-1", label: "CS0438719" },
                reason: "Notes",
                preferredTimes: [],
                durationMin: 60,
                scheduleTime: "2024-11-05 14:00:00",
                createdOn: "2024-10-29 10:00:00",
                updatedOn: "2024-10-29 10:00:00",
                state: { id: "1", label: "Pending" },
              },
            ],
          },
        ],
      },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);

    const loadMoreBtn = screen.getByRole("button", { name: /Load more/i });
    expect(loadMoreBtn).toBeInTheDocument();

    fireEvent.click(loadMoreBtn);

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it("should open Request Call modal when button is clicked", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      data: { pages: [{ callRequests: [] }] },
    } as unknown as ReturnType<typeof useGetCallRequests>);

    renderWithProviders(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);

    fireEvent.click(screen.getByRole("button", { name: /Request Call/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meeting Duration/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        /Describe your call request or topics you'd like to discuss/i,
      ),
    ).toBeInTheDocument();
  });
});
