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
import { describe, it, expect } from "vitest";
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

describe("DeploymentDocumentList", () => {
  it("should render documents count in accordion summary", () => {
    render(<DeploymentDocumentList documents={mockDocuments} />);

    expect(screen.getByText("Documents (2)")).toBeInTheDocument();
  });

  it("should render document list with names, sizes, dates, and uploaders", () => {
    render(<DeploymentDocumentList documents={mockDocuments} />);

    expect(screen.getByText("Architecture.pdf")).toBeInTheDocument();
    expect(screen.getByText("Deployment-Guide.pdf")).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it("should display 'No documents uploaded' when documents array is empty", () => {
    render(<DeploymentDocumentList documents={[]} />);

    expect(screen.getByText("Documents (0)")).toBeInTheDocument();
    expect(screen.getByText("No documents uploaded")).toBeInTheDocument();
  });

  it("should render download and delete icons for each document", () => {
    const { container } = render(
      <DeploymentDocumentList documents={mockDocuments} />,
    );

    // Each document should have 2 icon buttons (download and delete)
    const iconButtons = container.querySelectorAll("button");
    expect(iconButtons.length).toBeGreaterThanOrEqual(4); // 2 documents × 2 buttons
  });

  it("should properly format file sizes", () => {
    render(<DeploymentDocumentList documents={mockDocuments} />);

    // formatBytes should convert bytes to readable format like "1 MB"
    const sizeElements = screen.getAllByText(/MB|KB|GB/);
    expect(sizeElements.length).toBeGreaterThan(0);
  });

  it("should render single document correctly", () => {
    const singleDoc: DeploymentDocument[] = [mockDocuments[0]];
    render(<DeploymentDocumentList documents={singleDoc} />);

    expect(screen.getByText("Documents (1)")).toBeInTheDocument();
    expect(screen.getByText("Architecture.pdf")).toBeInTheDocument();
  });
});
