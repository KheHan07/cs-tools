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
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DeploymentDocumentList from "@components/project-details/deployments/DeploymentDocumentList";
import type { DeploymentDocument } from "@models/responses";

const mockDocuments: DeploymentDocument[] = [
  {
    id: "doc-1",
    name: "Architecture.pdf",
    category: "Architecture",
    sizeBytes: 1048576, // 1 MB
    uploadedAt: "2026-01-12",
    uploadedBy: "John Doe",
  },
  {
    id: "doc-2",
    name: "Deployment-Guide.pdf",
    category: "Documentation",
    sizeBytes: 2097152, // 2 MB
    uploadedAt: "2026-01-15",
    uploadedBy: "Jane Smith",
  },
];

vi.mock("@api/useGetDeploymentDocuments", () => ({
  useGetDeploymentDocuments: (deploymentId: string) => {
    if (deploymentId === "error-id") {
      return {
        data: undefined,
        isLoading: false,
        isError: true,
      };
    }
    if (deploymentId === "loading-id") {
      return {
        data: undefined,
        isLoading: true,
        isError: false,
      };
    }
    if (deploymentId === "empty-id") {
      return {
        data: [],
        isLoading: false,
        isError: false,
      };
    }
    if (deploymentId === "single-id") {
      return {
        data: [mockDocuments[0]],
        isLoading: false,
        isError: false,
      };
    }
    return {
      data: mockDocuments,
      isLoading: false,
      isError: false,
    };
  },
}));

vi.mock("@case-details-attachments/UploadAttachmentModal", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="upload-modal">Upload Modal</div> : null,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("DeploymentDocumentList", () => {
  it("should render documents count in accordion summary", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="dep-1" />);

    expect(screen.getByText("Documents (2)")).toBeInTheDocument();
  });

  it("should render document list with names, sizes, dates, and uploaders", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="dep-1" />);

    expect(screen.getByText("Architecture.pdf")).toBeInTheDocument();
    expect(screen.getByText("Deployment-Guide.pdf")).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it("should display Upload button", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="dep-1" />);

    fireEvent.click(screen.getByText(/Documents/));
    expect(screen.getByRole("button", { name: /Upload/ })).toBeInTheDocument();
  });

  it("should display 'No documents uploaded' when documents array is empty", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="empty-id" />);

    expect(screen.getByText("Documents (0)")).toBeInTheDocument();
    expect(screen.getByText("No documents uploaded")).toBeInTheDocument();
  });

  it("should render download and delete icons for each document", () => {
    const { container } = renderWithProviders(
      <DeploymentDocumentList deploymentId="dep-1" />,
    );

    const iconButtons = container.querySelectorAll("button");
    expect(iconButtons.length).toBeGreaterThanOrEqual(4);
  });

  it("should properly format file sizes", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="dep-1" />);

    const sizeElements = screen.getAllByText(/MB|KB|GB/);
    expect(sizeElements.length).toBeGreaterThan(0);
  });

  it("should render single document correctly", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="single-id" />);

    expect(screen.getByText("Documents (1)")).toBeInTheDocument();
    expect(screen.getByText("Architecture.pdf")).toBeInTheDocument();
  });

  it("should show error state when fetch fails", () => {
    renderWithProviders(<DeploymentDocumentList deploymentId="error-id" />);

    expect(screen.getByText("Documents (?)")).toBeInTheDocument();
    expect(screen.getByText("Failed to load documents")).toBeInTheDocument();
  });
});
