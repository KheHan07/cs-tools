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
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RequestCallModal from "@case-details-calls/RequestCallModal";

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
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderWithProviders(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("RequestCallModal", () => {
  it("should render form with Preferred Time, Meeting Duration, and Reason", () => {
    renderWithProviders(
      <RequestCallModal
        open
        projectId="proj-1"
        caseId="case-1"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Preferred Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meeting Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request \/ Description \*/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request Call/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("should show Edit Call Request title and hide Meeting Duration when editCall is provided", () => {
    const editCall = {
      id: "call-1",
      case: { id: "case-1", label: "CS1" },
      reason: "Notes",
      preferredTimes: ["2024-10-29 14:00:00"],
      durationMin: 30,
      scheduleTime: "2024-11-05 14:00:00",
      createdOn: "2024-10-29 10:00:00",
      updatedOn: "2024-10-29 10:00:00",
      state: { id: "2", label: "Pending" },
    };
    renderWithProviders(
      <RequestCallModal
        open
        projectId="proj-1"
        caseId="case-1"
        editCall={editCall}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Edit Call Request/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Meeting Duration/i)).not.toBeInTheDocument();
  });

  it("should disable submit button when required fields are empty", () => {
    renderWithProviders(
      <RequestCallModal
        open
        projectId="proj-1"
        caseId="case-1"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Request Call/i })).toBeDisabled();
  });

  it("should disable submit when description is empty in reschedule mode", () => {
    const editCall = {
      id: "call-1",
      case: { id: "case-1", label: "CS1" },
      reason: "",
      preferredTimes: ["2024-10-29T14:00:00Z"],
      durationMin: 30,
      scheduleTime: "2024-11-05T14:00:00Z",
      createdOn: "2024-10-29T10:00:00Z",
      updatedOn: "2024-10-29T10:00:00Z",
      state: { id: "2", label: "Pending" },
    };
    renderWithProviders(
      <RequestCallModal
        open
        projectId="proj-1"
        caseId="case-1"
        editCall={editCall}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Update Call Request/i })).toBeDisabled();
  });
});
