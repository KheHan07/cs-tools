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
import { describe, expect, it } from "vitest";
import type { CallRequest } from "@models/responses";
import CallRequestCard from "@case-details-calls/CallRequestCard";

const mockCall: CallRequest = {
  id: "call-1",
  type: "CALL_REQUEST",
  status: "SCHEDULED",
  requestedOn: "2024-10-29T10:00:00Z",
  preferredTime: {
    start: "14:00",
    end: "16:00",
    timezone: "EST",
  },
  scheduledFor: "2024-11-05T14:00:00Z",
  durationInMinutes: 60,
  notes: "Test notes for the call",
};

describe("CallRequestCard", () => {
  it("should render call request details correctly", () => {
    render(<CallRequestCard call={mockCall} />);

    expect(screen.getByText(/Call Request/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SCHEDULED/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Test notes for the call/i)).toBeInTheDocument();
    expect(screen.getByText(/14:00 - 16:00 EST/i)).toBeInTheDocument();
    expect(screen.getByText(/60 minutes/i)).toBeInTheDocument();
  });

  it("should format requestedOn date correctly", () => {
    render(<CallRequestCard call={mockCall} />);
    expect(screen.getByText(/Requested on Oct 29/i)).toBeInTheDocument();
  });

  it("should display '--' for missing or nullish values", () => {
    const incompleteCall = {
      id: "call-incomplete",
      type: "CALL_REQUEST",
    } as any;

    render(<CallRequestCard call={incompleteCall} />);

    const exactFallbacks = screen.getAllByText("--");
    expect(exactFallbacks).toHaveLength(3);
    expect(screen.getByText(/Requested on --/i)).toBeInTheDocument();
    expect(screen.getByText(/-- - -- --/i)).toBeInTheDocument();
    expect(screen.getByText(/-- minutes/i)).toBeInTheDocument();
  });
});
