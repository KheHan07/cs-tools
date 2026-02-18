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

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGetCallRequests } from "@api/useGetCallRequests";
import CallsPanel from "@case-details-calls/CallsPanel";

vi.mock("@api/useGetCallRequests");

const mockProjectId = "project-1";
const mockCaseId = "case-1";

describe("CallsPanel", () => {
  it("should render loading state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: true,
      data: undefined,
      isError: false,
    } as any);

    render(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(screen.getByTestId("calls-list-skeleton")).toBeInTheDocument();
  });

  it("should render error state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
    } as any);

    render(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(
      screen.getByText(/Error loading call requests/i),
    ).toBeInTheDocument();
  });

  it("should render call requests", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        callRequests: [
          {
            id: "call-1",
            status: "SCHEDULED",
            requestedOn: "2024-10-29T10:00:00Z",
            preferredTime: {
              start: "14:00",
              end: "16:00",
              timezone: "EST",
            },
            scheduledFor: "2024-11-05T14:00:00Z",
            durationInMinutes: 60,
            notes: "Test notes",
          },
        ],
      },
    } as any);

    render(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(screen.getByText(/Call Request/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SCHEDULED/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Test notes/i)).toBeInTheDocument();
  });

  it("should render empty state", () => {
    vi.mocked(useGetCallRequests).mockReturnValue({
      isPending: false,
      isError: false,
      data: { callRequests: [] },
    } as any);

    render(<CallsPanel projectId={mockProjectId} caseId={mockCaseId} />);
    expect(
      screen.getByText(/No call requests found for this case/i),
    ).toBeInTheDocument();
  });
});
