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
import DeploymentCard from "@components/project-details/deployments/DeploymentCard";
import type { Deployment } from "@models/responses";

const mockDeployment: Deployment = {
  id: "dep-1",
  name: "Production",
  status: "Healthy",
  url: "https://api.example.com",
  version: "v1.0",
  description: "Primary production environment",
  deployedAt: "2026-01-17",
  uptimePercent: 99.98,
  products: [
    {
      id: "prod-1",
      name: "WSO2 API Manager",
      version: "4.2.0",
      supportStatus: "Active Support",
      description: "API Gateway",
      cores: 8,
      tps: 5000,
      releasedDate: "2023-05-15",
      endOfLifeDate: "2026-05-15",
      updateLevel: "U22",
    },
  ],
  documents: [
    {
      id: "doc-1",
      name: "Architecture.pdf",
      category: "Architecture",
      sizeBytes: 1024,
      uploadedAt: "2026-01-12",
      uploadedBy: "John Doe",
    },
  ],
};

describe("DeploymentCard", () => {
  it("should render deployment name, status, url, and version", () => {
    render(<DeploymentCard deployment={mockDeployment} />);

    expect(
      screen.getByRole("heading", { name: "Production" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("https://api.example.com")).toBeInTheDocument();
    expect(screen.getByText("v1.0")).toBeInTheDocument();
    expect(
      screen.getByText("Primary production environment"),
    ).toBeInTheDocument();
  });

  it("should render products section with product name and description", () => {
    render(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByText("WSO2 Products (1)")).toBeInTheDocument();
    expect(screen.getByText("WSO2 API Manager")).toBeInTheDocument();
    expect(screen.getByText("API Gateway")).toBeInTheDocument();
  });

  it("should render documents section", () => {
    render(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByText("Documents (1)")).toBeInTheDocument();
    expect(screen.getByText("Architecture.pdf")).toBeInTheDocument();
  });

  it("should render deployed date and uptime", () => {
    render(<DeploymentCard deployment={mockDeployment} />);

    expect(screen.getByText(/Deployed/)).toBeInTheDocument();
    expect(screen.getByText(/Uptime: 99\.98%/)).toBeInTheDocument();
  });

  it("should show No products added yet when products array is empty", () => {
    const deploymentNoProducts: Deployment = {
      ...mockDeployment,
      products: [],
    };

    render(<DeploymentCard deployment={deploymentNoProducts} />);

    expect(screen.getByText("No products added yet")).toBeInTheDocument();
  });
});
