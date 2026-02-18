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
import CallRequestList from "@case-details-calls/CallRequestList";

const mockRequests: CallRequest[] = [
  {
    id: "call-1",
    type: "CALL_REQUEST",
    status: "SCHEDULED",
    requestedOn: "2024-10-29T10:00:00Z",
    preferredTime: { start: "14:00", end: "16:00", timezone: "EST" },
    scheduledFor: "2024-11-05T14:00:00Z",
    durationInMinutes: 60,
    notes: "Note 1",
  },
  {
    id: "call-2",
    type: "CALL_REQUEST",
    status: "PENDING",
    requestedOn: "2024-11-01T09:30:00Z",
    preferredTime: { start: "10:00", end: "11:00", timezone: "EST" },
    scheduledFor: "2024-11-06T10:00:00Z",
    durationInMinutes: 30,
    notes: "Note 2",
  },
];

describe("CallRequestList", () => {
  it("should render all call requests in the list", () => {
    render(<CallRequestList requests={mockRequests} />);

    expect(screen.getAllByText(/Call Request/i)).toHaveLength(2);
    expect(screen.getByText(/Note 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Note 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SCHEDULED/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PENDING/i).length).toBeGreaterThan(0);
  });
});
