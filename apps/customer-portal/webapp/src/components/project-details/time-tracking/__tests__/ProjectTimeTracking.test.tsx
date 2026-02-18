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
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectTimeTracking from "@time-tracking/ProjectTimeTracking";
import useGetTimeTrackingDetails from "@api/useGetTimeTrackingDetails";
import useGetProjectTimeTrackingStat from "@api/useGetProjectTimeTrackingStat";

// Mock the hooks
vi.mock("@api/useGetTimeTrackingDetails");
vi.mock("@api/useGetProjectTimeTrackingStat");

// Mock sub-components
vi.mock("@time-tracking/TimeTrackingStatCards", () => ({
  default: ({ isLoading, isError }: any) => (
    <div data-testid="stat-cards">
      {isLoading ? "Stats Loading" : "Stats Loaded"}
      {isError ? "Stats Error" : "Stats OK"}
    </div>
  ),
}));

vi.mock("@time-tracking/TimeTrackingCard", () => ({
  default: ({ log }: any) => (
    <div data-testid="time-log-card">{log.description}</div>
  ),
}));

vi.mock("@time-tracking/TimeTrackingCardSkeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}));

vi.mock("@time-tracking/TimeTrackingErrorState", () => ({
  default: () => <div data-testid="error-state">Error State</div>,
}));

vi.mock("@components/common/empty-state/EmptyState", () => ({
  default: ({ description }: any) => (
    <div data-testid="empty-state">{description}</div>
  ),
}));

describe("ProjectTimeTracking", () => {
  const projectId = "proj-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render 7 skeletons when details are loading", () => {
    vi.mocked(useGetProjectTimeTrackingStat).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGetTimeTrackingDetails).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(<ProjectTimeTracking projectId={projectId} />);

    expect(screen.getAllByTestId("skeleton")).toHaveLength(7);
  });

  it("should render error state when details fail to load", () => {
    vi.mocked(useGetProjectTimeTrackingStat).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGetTimeTrackingDetails).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<ProjectTimeTracking projectId={projectId} />);

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
  });

  it("should render time log cards when data is loaded", () => {
    const mockDetails = {
      timeLogs: [
        { id: "1", description: "Log 1", badges: [] },
        { id: "2", description: "Log 2", badges: [] },
      ],
    };

    vi.mocked(useGetProjectTimeTrackingStat).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGetTimeTrackingDetails).mockReturnValue({
      data: mockDetails,
      isLoading: false,
      isError: false,
    } as any);

    render(<ProjectTimeTracking projectId={projectId} />);

    expect(screen.getByText("Log 1")).toBeInTheDocument();
    expect(screen.getByText("Log 2")).toBeInTheDocument();
    expect(screen.getAllByTestId("time-log-card")).toHaveLength(2);
  });

  it("should always render stat cards regardless of details state", () => {
    vi.mocked(useGetProjectTimeTrackingStat).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGetTimeTrackingDetails).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(<ProjectTimeTracking projectId={projectId} />);

    expect(screen.getByTestId("stat-cards")).toBeInTheDocument();
  });

  it("should render empty state when there are no time logs", () => {
    vi.mocked(useGetProjectTimeTrackingStat).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGetTimeTrackingDetails).mockReturnValue({
      data: { timeLogs: [] },
      isLoading: false,
      isError: false,
    } as any);

    render(<ProjectTimeTracking projectId={projectId} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No time logs available.")).toBeInTheDocument();
  });
});
