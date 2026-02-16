// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License
// at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied.  See the License for the specific language governing
// permissions and limitations under the License.

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider, createTheme } from "@wso2/oxygen-ui";
import Editor from "@components/common/rich-text-editor/Editor";

vi.mock("@hooks/useLogger", () => ({
  useLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

function renderEditor(props: Parameters<typeof Editor>[0] = {}) {
  return render(
    <ThemeProvider theme={createTheme()}>
      <Editor {...props} />
    </ThemeProvider>,
  );
}

describe("Editor", () => {
  it("renders without throwing", () => {
    renderEditor();
    expect(screen.getByTestId("case-description-editor")).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    renderEditor();
    expect(screen.getByText("Enter description...")).toBeInTheDocument();
  });

  it("renders when disabled", () => {
    renderEditor({ disabled: true });
    expect(screen.getByTestId("case-description-editor")).toBeInTheDocument();
  });

  it("renders attachments section when attachments provided", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    renderEditor({ attachments: [file] });
    expect(screen.getByText(/Attachments \(1\)/)).toBeInTheDocument();
  });
});
