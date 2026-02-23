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

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddProductModal from "@components/project-details/deployments/AddProductModal";
import { useGetProducts } from "@api/useGetProducts";
import { useSearchProductVersions } from "@api/useSearchProductVersions";
import { usePostDeploymentProduct } from "@api/usePostDeploymentProduct";

vi.mock("@api/useGetProducts");
vi.mock("@api/useSearchProductVersions");
vi.mock("@api/usePostDeploymentProduct");

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(
  ui: React.ReactElement,
  options?: { queryClient?: QueryClient },
) {
  const client = options?.queryClient ?? queryClient;
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

const mockProducts = [
  { id: "prod-api-mgr", label: "WSO2 API Manager", name: "API Manager" },
  { id: "prod-id", label: "WSO2 Identity Server", name: "Identity Server" },
];

const mockVersions = [
  { id: "ver-781", version: "7.8.0", product: { id: "prod-api-mgr", label: "WSO2 API Manager" } },
  { id: "ver-450", version: "4.5.0", product: { id: "prod-api-mgr", label: "WSO2 API Manager" } },
];

describe("AddProductModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetProducts).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetProducts>);
    vi.mocked(useSearchProductVersions).mockReturnValue({
      data: mockVersions,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useSearchProductVersions>);
    vi.mocked(usePostDeploymentProduct).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof usePostDeploymentProduct>);
  });

  it("should not render when open is false", () => {
    renderWithProviders(
      <AddProductModal
        open={false}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when open is true", () => {
    renderWithProviders(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add WSO2 Product")).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Version/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Core Count/)).toBeInTheDocument();
    expect(screen.getByLabelText(/TPS/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByText("Initial Update Information")).toBeInTheDocument();
  });

  it("should disable version dropdown until product is selected", () => {
    renderWithProviders(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );

    const versionSelect = screen.getByLabelText(/Version/);
    expect(versionSelect).toHaveAttribute("aria-disabled", "true");
  });

  it("should validate required fields", () => {
    renderWithProviders(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Add Product" });
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit and call API when product and version selected", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    renderWithProviders(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const productSelect = screen.getByLabelText(/Product Name/);
    fireEvent.mouseDown(productSelect);
    fireEvent.click(screen.getByText("WSO2 API Manager"));

    const versionSelect = screen.getByLabelText(/Version/);
    fireEvent.mouseDown(versionSelect);
    fireEvent.click(screen.getByText("7.8.0"));

    const submitButton = screen.getByRole("button", { name: "Add Product" });
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        deploymentId: "dep-1",
        body: {
          productId: "prod-api-mgr",
          versionId: "ver-781",
          projectId: "proj-1",
          cores: undefined,
          tps: undefined,
        },
      });
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should include cores and tps when provided", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    renderWithProviders(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.mouseDown(screen.getByLabelText(/Product Name/));
    fireEvent.click(screen.getByText("WSO2 API Manager"));

    fireEvent.mouseDown(screen.getByLabelText(/Version/));
    fireEvent.click(screen.getByText("7.8.0"));

    fireEvent.change(screen.getByLabelText(/Core Count/), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText(/TPS/), {
      target: { value: "5000" },
    });

    const submitButton = screen.getByRole("button", { name: "Add Product" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        deploymentId: "dep-1",
        body: {
          productId: "prod-api-mgr",
          versionId: "ver-781",
          projectId: "proj-1",
          cores: 8,
          tps: 5000,
        },
      });
    });
  });

  it("should reset form on close", () => {
    const { rerender } = renderWithProviders(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );

    const productCombobox = screen.getByRole("combobox", {
      name: /Product Name/,
    });
    fireEvent.mouseDown(productCombobox);
    fireEvent.click(screen.getByText("WSO2 API Manager"));
    expect(productCombobox).toHaveTextContent(/WSO2 API Manager/);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnClose).toHaveBeenCalled();

    // Simulate parent closing and reopening modal; form should be reset.
    rerender(
      <AddProductModal
        open={false}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );
    rerender(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        projectId="proj-1"
        onClose={mockOnClose}
      />,
    );

    // After reset, Product Name should be cleared (empty selection)
    expect(
      screen.getByRole("combobox", { name: /Product Name/ }),
    ).not.toHaveTextContent("WSO2 API Manager");
  });
});
