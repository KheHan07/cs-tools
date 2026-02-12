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
import { describe, expect, it, vi } from "vitest";
import { ConversationSummary } from "@components/support/case-creation-layout/sections/conversation-summary-section/ConversationSummary";
import type { CaseCreationMetadata } from "@models/mockData";

// Mock @wso2/oxygen-ui components
vi.mock("@wso2/oxygen-ui", () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  colors: {
    orange: { 700: "#C2410C" },
  },
  Divider: () => <hr />,
  Paper: ({ children }: any) => <div data-testid="paper">{children}</div>,
  Skeleton: ({ width }: any) => (
    <div data-testid="skeleton" style={{ width }}>
      Skeleton
    </div>
  ),
  Typography: ({ children }: any) => <span>{children}</span>,
}));

// Mock icons
vi.mock("@wso2/oxygen-ui-icons-react", () => ({
  Bot: () => <svg data-testid="icon-bot" />,
  MessageSquare: () => <svg data-testid="icon-message" />,
}));

vi.mock("@components/common/error-indicator/ErrorIndicator", () => ({
  default: ({ entityName }: { entityName: string }) => (
    <span data-testid="error-indicator" data-entity={entityName}>
      Error: {entityName}
    </span>
  ),
}));

describe("ConversationSummary", () => {
  const mockMetadata: CaseCreationMetadata = {
    projects: [],
    products: [],
    deploymentTypes: [],
    issueTypes: [],
    severityLevels: [],
    conversationSummary: {
      messagesExchanged: 10,
      troubleshootingAttempts: "3 attempts",
      kbArticlesReviewed: "5 articles",
    },
  };

  it("should render statistics when not loading", () => {
    render(<ConversationSummary metadata={mockMetadata} isLoading={false} />);

    expect(screen.getByText("Conversation Summary")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("3 attempts")).toBeInTheDocument();
    expect(screen.getByText("5 articles")).toBeInTheDocument();
    expect(screen.queryAllByTestId("skeleton")).toHaveLength(0);
  });

  it("should render skeletons when loading", () => {
    render(<ConversationSummary metadata={undefined} isLoading={true} />);

    expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("should render conversation attachment tip", () => {
    render(<ConversationSummary metadata={mockMetadata} isLoading={false} />);

    expect(screen.getByTestId("icon-bot")).toBeInTheDocument();
    expect(
      screen.getByText(/All conversation details will be attached/),
    ).toBeInTheDocument();
  });

  it("should render error indicators when metadata conversation summary is missing", () => {
    render(<ConversationSummary metadata={{} as CaseCreationMetadata} isLoading={false} />);

    const errorIndicators = screen.getAllByTestId("error-indicator");
    expect(errorIndicators).toHaveLength(3);
    expect(errorIndicators[0]).toHaveAttribute(
      "data-entity",
      "Messages exchanged",
    );
    expect(errorIndicators[1]).toHaveAttribute(
      "data-entity",
      "Troubleshooting attempts",
    );
    expect(errorIndicators[2]).toHaveAttribute(
      "data-entity",
      "KB articles reviewed",
    );
  });
});
