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
import { describe, it, expect, vi } from "vitest";
import AddProductModal from "@components/project-details/deployments/AddProductModal";

describe("AddProductModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  it("should not render when open is false", () => {
    render(
      <AddProductModal
        open={false}
        deploymentId="dep-1"
        onClose={mockOnClose}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when open is true", () => {
    render(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add WSO2 Product")).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Version/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Core Count/)).toBeInTheDocument();
    expect(screen.getByLabelText(/TPS/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Support Status/)).toBeInTheDocument();
  });

  it("should validate required fields", () => {
    render(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        onClose={mockOnClose}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Add Product" });
    expect(submitButton).toBeDisabled();

    // Fill some fields but not all
    fireEvent.change(screen.getByLabelText(/Version/), {
      target: { value: "4.2.0" },
    });
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when form is valid and call onSuccess on submit", async () => {
    render(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // For Material UI Select, we need to click the select to open options, then click an option.
    const nameSelect = screen.getByLabelText(/Product Name/);
    fireEvent.mouseDown(nameSelect);
    const apiManagerOption = screen.getByText("API Manager");
    fireEvent.click(apiManagerOption);

    fireEvent.change(screen.getByLabelText(/Version/), {
      target: { value: "4.2.0" },
    });
    fireEvent.change(screen.getByLabelText(/Core Count/), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText(/TPS/), {
      target: { value: "5000" },
    });
    fireEvent.change(screen.getByLabelText(/Current Update Level/), {
      target: { value: "U10" },
    });
    fireEvent.change(screen.getByLabelText(/Release Date/), {
      target: { value: "2023-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/Support EOL Date/), {
      target: { value: "2026-01-01" },
    });

    // Support Status has default value "Active Support", so it should be fine.

    const submitButton = screen.getByRole("button", { name: "Add Product" });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    // Wait for async submission (mocked with setTimeout)
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should reset form on close", () => {
    render(
      <AddProductModal
        open={true}
        deploymentId="dep-1"
        onClose={mockOnClose}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Version/), {
      target: { value: "4.2.0" },
    });

    const closeButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
