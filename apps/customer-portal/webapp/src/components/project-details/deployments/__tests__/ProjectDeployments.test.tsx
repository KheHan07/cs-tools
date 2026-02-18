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

import { render, screen, fireEvent } from "@testing-library/react";
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

// Mock AddDeploymentModal so we can test open/close without full modal rendering
vi.mock("@components/project-details/deployments/AddDeploymentModal", () => ({
  default: ({
    open,
    onClose,
    onSuccess,
    onError,
  }: {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
  }) =>
    open ? (
      <div data-testid="add-deployment-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSuccess?.()}>Trigger Success</button>
        <button onClick={() => onError?.("API error")}>Trigger Error</button>
      </div>
    ) : null,
}));

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
vi.mock("@components/common/success-banner/SuccessBanner", () => ({
  default: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="success-banner">
      {message}
      <button onClick={onClose}>Dismiss</button>
    </div>
  ),
}));
vi.mock("@components/common/error-banner/ErrorBanner", () => ({
  default: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="error-banner">
      {message}
      <button onClick={onClose}>Dismiss</button>
    </div>
  ),
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

  it("should show loading skeletons when isLoading is true", () => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);

    render(<ProjectDeployments projectId="project-123" />);

    expect(screen.getAllByTestId("deployment-skeleton")).toHaveLength(3);
  });

  it("should show empty state when data is undefined and not loading (initial state)", () => {
    vi.mocked(useGetProjectDeploymentDetails).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGetProjectDeploymentDetails>);

    render(<ProjectDeployments projectId="project-123" />);

    // When data is undefined and not loading, deployments defaults to [] → empty state
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
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

  it("should open AddDeploymentModal when Add Deployment button is clicked", () => {
    render(<ProjectDeployments projectId="project-123" />);

    expect(
      screen.queryByTestId("add-deployment-modal"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Add Deployment/i }));

    expect(screen.getByTestId("add-deployment-modal")).toBeInTheDocument();
  });

  it("should close AddDeploymentModal when onClose is called", () => {
    render(<ProjectDeployments projectId="project-123" />);

    fireEvent.click(screen.getByRole("button", { name: /Add Deployment/i }));
    expect(screen.getByTestId("add-deployment-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close Modal" }));
    expect(
      screen.queryByTestId("add-deployment-modal"),
    ).not.toBeInTheDocument();
  });

  it("should show SuccessBanner after successful deployment creation", () => {
    render(<ProjectDeployments projectId="project-123" />);

    fireEvent.click(screen.getByRole("button", { name: /Add Deployment/i }));
    fireEvent.click(screen.getByRole("button", { name: "Trigger Success" }));

    expect(screen.getByTestId("success-banner")).toBeInTheDocument();
    expect(
      screen.getByText("Deployment created successfully."),
    ).toBeInTheDocument();
  });

  it("should show ErrorBanner when deployment creation fails", () => {
    render(<ProjectDeployments projectId="project-123" />);

    fireEvent.click(screen.getByRole("button", { name: /Add Deployment/i }));
    fireEvent.click(screen.getByRole("button", { name: "Trigger Error" }));

    expect(screen.getByTestId("error-banner")).toBeInTheDocument();
    expect(screen.getByText("API error")).toBeInTheDocument();
  });

  it("should dismiss SuccessBanner when close is clicked", () => {
    render(<ProjectDeployments projectId="project-123" />);

    fireEvent.click(screen.getByRole("button", { name: /Add Deployment/i }));
    fireEvent.click(screen.getByRole("button", { name: "Trigger Success" }));
    expect(screen.getByTestId("success-banner")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByTestId("success-banner")).not.toBeInTheDocument();
  });

  it("should dismiss ErrorBanner when close is clicked", () => {
    render(<ProjectDeployments projectId="project-123" />);

    fireEvent.click(screen.getByRole("button", { name: /Add Deployment/i }));
    fireEvent.click(screen.getByRole("button", { name: "Trigger Error" }));
    expect(screen.getByTestId("error-banner")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByTestId("error-banner")).not.toBeInTheDocument();
  });
});
