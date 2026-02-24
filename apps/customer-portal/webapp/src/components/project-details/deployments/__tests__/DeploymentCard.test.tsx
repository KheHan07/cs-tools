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
import DeploymentCard from "@components/project-details/deployments/DeploymentCard";
import type { ProjectDeploymentItem } from "@models/responses";

const mockDeployment: ProjectDeploymentItem = {
  id: "dep-1",
  name: "Production",
  createdOn: "2026-01-17",
  updatedOn: "2026-01-17",
  description: "Primary production environment",
  url: "https://api.example.com",
  project: { id: "proj-1", label: "Test Project" },
  type: { id: "3", label: "Staging" },
};

vi.mock("@api/useGetDeploymentsProducts", () => ({
  useGetDeploymentsProducts: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@api/useGetProducts", () => ({
  useGetProducts: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@api/useSearchProductVersions", () => ({
  useSearchProductVersions: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock("@api/usePostDeploymentProduct", () => ({
  usePostDeploymentProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));
vi.mock("@api/usePatchDeploymentProduct", () => ({
  usePatchDeploymentProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@api/useInfiniteDeploymentDocuments", () => ({
  useInfiniteDeploymentDocuments: () => ({
    data: { pages: [{ attachments: [], totalRecords: 0 }], pageParams: [0] },
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  flattenDeploymentDocuments: () => [],
}));

vi.mock("@case-details-attachments/UploadAttachmentModal", () => ({
  default: () => null,
}));

vi.mock("@api/usePatchDeployment", () => ({
  usePatchDeployment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@components/project-details/deployments/EditDeploymentModal", () => ({
  default: () => null,
}));

vi.mock("@components/project-details/deployments/DeleteDeploymentModal", () => ({
  default: () => null,
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderWithProviders(ui: ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("DeploymentCard", () => {
  it("should render deployment name, ErrorIndicators for missing fields, and url", () => {
    renderWithProviders(<DeploymentCard deployment={mockDeployment} />);

    expect(
      screen.getByRole("heading", { name: "Production" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("error-indicator").length).toBeGreaterThan(0);
    expect(screen.getByText("https://api.example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Primary production environment"),
    ).toBeInTheDocument();
  });

  it("should render products section", () => {
    renderWithProviders(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByText("WSO2 Products")).toBeInTheDocument();
    expect(screen.getAllByText("(0)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("No products added yet")).toBeInTheDocument();
  });

  it("should render documents section with Upload button", () => {
    renderWithProviders(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByRole("button", { name: /Upload/ })).toBeInTheDocument();
  });

  it("should render documents section", () => {
    renderWithProviders(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getAllByText("(0)").length).toBeGreaterThanOrEqual(1);
  });

  it("should display Not Available for null description", () => {
    const deploymentNoDesc: ProjectDeploymentItem = {
      ...mockDeployment,
      description: null,
    };

    renderWithProviders(<DeploymentCard deployment={deploymentNoDesc} />);

    expect(screen.getByText("Not Available")).toBeInTheDocument();
  });

  it("should display Edit and Delete icon buttons", () => {
    renderWithProviders(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByRole("button", { name: "Edit deployment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete deployment" })).toBeInTheDocument();
  });
});
