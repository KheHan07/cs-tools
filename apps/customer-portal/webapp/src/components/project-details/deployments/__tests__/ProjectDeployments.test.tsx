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
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectDeployments from "@components/project-details/deployments/ProjectDeployments";
import { useGetProjectDeploymentDetails } from "@api/useGetProjectDeploymentDetails";

const mockDeployments = {
  deployments: [
    {
      id: "dep-1",
      name: "Production",
      status: "Healthy" as const,
      url: "https://api.example.com",
      version: "v1.0",
      description: "Production env",
      deployedAt: "2026-01-17",
      uptimePercent: 99.98,
      products: [],
      documents: [],
    },
  ],
};

vi.mock("@api/useGetProjectDeploymentDetails");
vi.mock(
  "@components/project-details/deployments/DeploymentCardSkeleton",
  () => ({
    default: () => <div data-testid="deployment-skeleton" />,
  }),
);
vi.mock("@components/common/error-state/ErrorStateIcon", () => ({
  default: () => <div data-testid="error-state-icon" />,
}));
vi.mock("@components/common/empty-state/EmptyState", () => ({
  default: () => <div data-testid="empty-state" />,
}));

describe("ProjectDeployments", () => {
  beforeEach(() => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: mockDeployments,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);
  });

  it("should render deployment cards when data is loaded", () => {
    render(<ProjectDeployments projectId="project-123" />);

    expect(screen.getByText("1 deployment environment")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Production" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("should show Invalid Project ID when projectId is empty", () => {
    render(<ProjectDeployments projectId="" />);

    expect(screen.getByText("Invalid Project ID.")).toBeInTheDocument();
  });

  it("should show loading indicator when isLoading is true", () => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);

    render(<ProjectDeployments projectId="project-123" />);

    expect(screen.getAllByTestId("deployment-skeleton")).toHaveLength(3);
  });

  it("should show loading indicator when data is undefined and no error (initial state)", () => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);

    render(<ProjectDeployments projectId="project-123" />);

    expect(screen.getAllByTestId("deployment-skeleton")).toHaveLength(3);
  });

  it("should show error state when isError is true", () => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network error"),
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);

    render(<ProjectDeployments projectId="project-123" />);

    expect(screen.getByTestId("error-state-icon")).toBeInTheDocument();
  });

  it("should show empty state when deployments are empty", () => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: { deployments: [] },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);

    render(<ProjectDeployments projectId="project-123" />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });
});
