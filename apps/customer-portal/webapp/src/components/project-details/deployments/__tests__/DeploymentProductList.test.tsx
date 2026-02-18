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

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DeploymentProductList from "@components/project-details/deployments/DeploymentProductList";
import type { DeploymentProduct } from "@models/responses";

const mockProducts: DeploymentProduct[] = [
  {
    id: "prod-1",
    name: "WSO2 API Manager",
    version: "4.2.0",
    supportStatus: "Active Support",
    description: "API Gateway and Management Platform",
    cores: 8,
    tps: 5000,
    releasedDate: "2023-05-15",
    endOfLifeDate: "2026-05-15",
    updateLevel: "U22",
  },
  {
    id: "prod-2",
    name: "WSO2 Identity Server",
    version: "6.1.0",
    supportStatus: "Active Support",
    description: "IAM and Identity Management Solution",
    cores: 4,
    tps: 3000,
    releasedDate: "2023-08-20",
    endOfLifeDate: "2026-08-20",
    updateLevel: "U15",
  },
];

describe("DeploymentProductList", () => {
  it("should render products count and 'Add Product' button", () => {
    render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    expect(screen.getByText("WSO2 Products (2)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Product/i }),
    ).toBeInTheDocument();
  });

  it("should render product details (name, version, support status)", () => {
    render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    expect(screen.getByText("WSO2 API Manager")).toBeInTheDocument();
    expect(screen.getByText("4.2.0")).toBeInTheDocument();
    expect(screen.getByText("WSO2 Identity Server")).toBeInTheDocument();
    expect(screen.getByText("6.1.0")).toBeInTheDocument();

    // Support status should appear twice (once for each product)
    const supportStatuses = screen.getAllByText("Active Support");
    expect(supportStatuses).toHaveLength(2);
  });

  it("should display technical specs (cores, TPS, release date, EOL date)", () => {
    render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    expect(screen.getByText("8 cores")).toBeInTheDocument();
    expect(screen.getByText("5,000 TPS")).toBeInTheDocument();
    expect(screen.getByText("4 cores")).toBeInTheDocument();
    expect(screen.getByText("3,000 TPS")).toBeInTheDocument();

    // Released and EOL dates should be formatted and displayed
    const releasedLabels = screen.getAllByText(/Released:/);
    expect(releasedLabels.length).toBeGreaterThan(0);
    const eolLabels = screen.getAllByText(/EOL:/);
    expect(eolLabels.length).toBeGreaterThan(0);
  });

  it("should display 'No products added yet' when products array is empty", () => {
    render(<DeploymentProductList products={[]} deploymentId="dep-123" />);

    expect(screen.getByText("WSO2 Products (0)")).toBeInTheDocument();
    expect(screen.getByText("No products added yet")).toBeInTheDocument();
  });

  it("should render update level chip for each product", () => {
    render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    expect(screen.getByText("Update Level: U22")).toBeInTheDocument();
    expect(screen.getByText("Update Level: U15")).toBeInTheDocument();
  });

  it("should render product descriptions", () => {
    render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    expect(
      screen.getByText("API Gateway and Management Platform"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("IAM and Identity Management Solution"),
    ).toBeInTheDocument();
  });

  it("should render checkboxes for each product", () => {
    const { container } = render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });

  it("should handle single product correctly", () => {
    const singleProduct: DeploymentProduct[] = [mockProducts[0]];
    render(
      <DeploymentProductList products={singleProduct} deploymentId="dep-123" />,
    );

    expect(screen.getByText("WSO2 Products (1)")).toBeInTheDocument();
    expect(screen.getByText("WSO2 API Manager")).toBeInTheDocument();
    expect(screen.queryByText("WSO2 Identity Server")).not.toBeInTheDocument();
  });

  it("should open Add Product modal when button is clicked", () => {
    render(
      <DeploymentProductList products={mockProducts} deploymentId="dep-123" />,
    );

    const addButton = screen.getByRole("button", { name: /Add Product/i });
    fireEvent.click(addButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add WSO2 Product")).toBeInTheDocument();
  });
});
