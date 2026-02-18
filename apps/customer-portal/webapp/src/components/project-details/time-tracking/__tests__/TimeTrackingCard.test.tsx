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
import { describe, it, expect, vi } from "vitest";
import TimeTrackingCard from "@time-tracking/TimeTrackingCard";
import { type TimeTrackingLog } from "@models/responses";
import { TIME_TRACKING_BADGE_TYPES } from "@constants/projectDetailsConstants";

// Mock @wso2/oxygen-ui-icons-react
vi.mock("@wso2/oxygen-ui-icons-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@wso2/oxygen-ui-icons-react")>();
  return {
    ...actual,
    User: () => <div data-testid="user-icon" />,
    Shield: () => <div data-testid="shield-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
  };
});

// Mock useTheme and alpha
vi.mock("@wso2/oxygen-ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@wso2/oxygen-ui")>();
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        warning: { main: "#ff9800" },
        success: { main: "#4caf50" },
        info: { main: "#2196f3" },
        secondary: { main: "#9c27b0" },
        primary: { main: "#3f51b5" },
      },
    }),
    alpha: (color: string, opacity: number) => `rgba(${color}, ${opacity})`,
  };
});

describe("TimeTrackingCard", () => {
  const mockLog: TimeTrackingLog = {
    id: "1",
    badges: [
      { text: "Support", type: TIME_TRACKING_BADGE_TYPES.SUPPORT },
      { text: "Billable", type: TIME_TRACKING_BADGE_TYPES.BILLABLE },
    ],
    description: "Test description",
    user: "Test User",
    role: "Test Role",
    date: "2026-01-16",
    hours: 4.5,
  };

  it("should render card with all information", () => {
    render(<TimeTrackingCard log={mockLog} />);

    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Test Role")).toBeInTheDocument();
    expect(screen.getByText("2026-01-16")).toBeInTheDocument();
    expect(screen.getByText("4.5h")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Billable")).toBeInTheDocument();
  });

  it("should show fallback '--' for missing values", () => {
    const incompleteLog: TimeTrackingLog = {
      id: "2",
      badges: [],
      description: null,
      user: null,
      role: null,
      date: null,
      hours: null,
    };

    render(<TimeTrackingCard log={incompleteLog} />);

    const fallbacks = screen.getAllByText("--");
    expect(fallbacks.length).toBeGreaterThan(0);
  });

  it("should correctly render badge types with different colors", () => {
    const badgeLog: TimeTrackingLog = {
      ...mockLog,
      badges: [
        { text: "Case", type: TIME_TRACKING_BADGE_TYPES.CASE },
        { text: "Maintenance", type: TIME_TRACKING_BADGE_TYPES.MAINTENANCE },
      ],
    };

    render(<TimeTrackingCard log={badgeLog} />);

    expect(screen.getByText("Case")).toBeInTheDocument();
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
  });
});
