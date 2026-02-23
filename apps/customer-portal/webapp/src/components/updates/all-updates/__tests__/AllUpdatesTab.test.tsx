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
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import AllUpdatesTab from "@components/updates/all-updates/AllUpdatesTab";

vi.mock("@api/useGetRecommendedUpdateLevels", () => ({
  useGetRecommendedUpdateLevels: () => ({
    data: [
      {
        productName: "WSO2 API Manager",
        productBaseVersion: "4.4.0",
        channel: "full",
        startingUpdateLevel: 2,
        endingUpdateLevel: 19,
        recommendedUpdateLevel: 19,
        installedUpdatesCount: 3,
        installedSecurityUpdatesCount: 2,
        availableUpdatesCount: 15,
        availableSecurityUpdatesCount: 10,
        timestamp: 0,
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@api/usePostUpdateLevelsSearch", () => ({
  usePostUpdateLevelsSearch: () => ({
    data: null,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("react-router", async (importOriginal) => {
  const orig = await importOriginal<typeof import("react-router")>();
  return {
    ...orig,
    useNavigate: () => vi.fn(),
  };
});

describe("AllUpdatesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders filter section with dropdown labels", () => {
    render(
      <MemoryRouter>
        <AllUpdatesTab />
      </MemoryRouter>,
    );
    expect(screen.getByText("Search Update Levels")).toBeDefined();
    expect(screen.getByLabelText(/Product Name/)).toBeDefined();
    expect(screen.getByLabelText(/Product Version/)).toBeDefined();
    expect(screen.getByLabelText(/Starting Update Level/)).toBeDefined();
    expect(screen.getByLabelText(/Ending Update Level/)).toBeDefined();
  });

  it("renders Search and View Report buttons", () => {
    render(
      <MemoryRouter>
        <AllUpdatesTab />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /Search/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /View Report/i })).toBeDefined();
  });

  it("shows placeholder text when no search has been run", () => {
    render(
      <MemoryRouter>
        <AllUpdatesTab />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/Select product, version, and update level range/),
    ).toBeDefined();
  });
});
