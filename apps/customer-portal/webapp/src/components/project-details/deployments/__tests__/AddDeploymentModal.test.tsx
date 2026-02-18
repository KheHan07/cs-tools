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
import AddDeploymentModal from "@components/project-details/deployments/AddDeploymentModal";
import { usePostCreateDeployment } from "@api/usePostCreateDeployment";
import useGetCasesFilters from "@api/useGetCasesFilters";

vi.mock("@api/usePostCreateDeployment");
vi.mock("@api/useGetCasesFilters");

const mockMutate = vi.fn();

const mockFiltersData = {
  deploymentTypes: [
    { id: "1", label: "Development" },
    { id: "2", label: "QA" },
    { id: "3", label: "Staging" },
    { id: "4", label: "Primary Production" },
  ],
};

const defaultModalProps = {
  open: true,
  projectId: "project-123",
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  onError: vi.fn(),
};

describe("AddDeploymentModal", () => {
  beforeEach(() => {
    vi.mocked(usePostCreateDeployment).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof usePostCreateDeployment>);

    vi.mocked(useGetCasesFilters).mockReturnValue({
      data: mockFiltersData,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetCasesFilters>);
  });

  it("should render the modal with title and description", () => {
    render(<AddDeploymentModal {...defaultModalProps} />);

    expect(screen.getByText("Add New Deployment")).toBeInTheDocument();
    expect(
      screen.getByText("Create a new deployment environment for your project."),
    ).toBeInTheDocument();
  });

  it("should render Deployment Name and Description fields", () => {
    render(<AddDeploymentModal {...defaultModalProps} />);

    expect(screen.getByLabelText(/Deployment Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it("should render deployment type select from the API", () => {
    render(<AddDeploymentModal {...defaultModalProps} />);

    expect(screen.getByLabelText(/Deployment Type/i)).toBeInTheDocument();
  });

  it("should show skeleton while deployment types are loading", () => {
    vi.mocked(useGetCasesFilters).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useGetCasesFilters>);

    render(<AddDeploymentModal {...defaultModalProps} />);

    // While loading, the Deployment Type select should not be rendered
    expect(screen.queryByLabelText(/Deployment Type/i)).not.toBeInTheDocument();
  });

  it("should show ErrorIndicator when deployment types fail to load", () => {
    vi.mocked(useGetCasesFilters).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useGetCasesFilters>);

    render(<AddDeploymentModal {...defaultModalProps} />);

    expect(screen.getByTestId("error-indicator")).toBeInTheDocument();
  });

  it("should disable Add Deployment button when form is incomplete", () => {
    render(<AddDeploymentModal {...defaultModalProps} />);

    const addButton = screen.getByRole("button", { name: /Add Deployment/i });
    expect(addButton).toBeDisabled();
  });

  it("should disable Add Deployment button when filters failed to load", () => {
    vi.mocked(useGetCasesFilters).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useGetCasesFilters>);

    render(<AddDeploymentModal {...defaultModalProps} />);

    const addButton = screen.getByRole("button", { name: /Add Deployment/i });
    expect(addButton).toBeDisabled();
  });

  it("should call onClose when Cancel button is clicked", () => {
    const onClose = vi.fn();
    render(<AddDeploymentModal {...defaultModalProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when X icon button is clicked", () => {
    const onClose = vi.fn();
    render(<AddDeploymentModal {...defaultModalProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show loading state when mutation is pending", () => {
    vi.mocked(usePostCreateDeployment).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof usePostCreateDeployment>);

    render(<AddDeploymentModal {...defaultModalProps} />);

    expect(screen.getByText("Creating...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDisabled();
  });

  it("should not render when open is false", () => {
    render(<AddDeploymentModal {...defaultModalProps} open={false} />);

    expect(screen.queryByText("Add New Deployment")).not.toBeInTheDocument();
  });

  it("should keep Add Deployment button disabled when only name is filled", () => {
    render(<AddDeploymentModal {...defaultModalProps} />);

    // Fill only the name field — button should still be disabled
    fireEvent.change(screen.getByLabelText(/Deployment Name/i), {
      target: { value: "My Deployment" },
    });

    const addButton = screen.getByRole("button", { name: /Add Deployment/i });
    expect(addButton).toBeDisabled();
  });
});
