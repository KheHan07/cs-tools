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

import { describe, expect, it } from "vitest";
import {
  getBlockDisplay,
  markdownToHtml,
  htmlToMarkdown,
  createCodeBlockHtml,
} from "@utils/richTextEditor";

describe("richTextEditor utils", () => {
  describe("getBlockDisplay", () => {
    it("should return correct display info for heading tags", () => {
      expect(getBlockDisplay("h1")).toEqual({
        value: "h1",
        label: "Heading 1",
        variant: "h1",
      });
      expect(getBlockDisplay("H1")).toEqual({
        value: "h1",
        label: "Heading 1",
        variant: "h1",
      });
    });

    it("should return default for unknown tags", () => {
      expect(getBlockDisplay("unknown")).toEqual({
        label: "Body 2",
        variant: "body2",
      });
    });
  });

  describe("markdownToHtml", () => {
    it("should convert simple markdown to html", () => {
      const md = "## Title\n\nThis is **bold** and *italic*.\n\n- List item";
      const html = markdownToHtml(md);
      expect(html).toContain("<h2>Title</h2>");
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("<em>italic</em>");
    });

    it("should handle links", () => {
      const md = "[WSO2](https://wso2.com)";
      const html = markdownToHtml(md);
      expect(html).toContain('<a href="https://wso2.com"');
    });
  });

  describe("htmlToMarkdown", () => {
    it("should convert simple html to markdown", () => {
      const html = "<h2>Title</h2><p>This is <strong>bold</strong>.</p>";
      const md = htmlToMarkdown(html);
      expect(md).toContain("## Title");
      expect(md).toContain("**bold**");
    });

    it("should handle lists", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const md = htmlToMarkdown(html);
      expect(md).toContain("- Item 1");
      expect(md).toContain("- Item 2");
    });
  });

  describe("createCodeBlockHtml", () => {
    it("should create correct code block structure", () => {
      const code = "const x = 1;";
      const html = createCodeBlockHtml(code);
      expect(html).toContain("<pre><code>const x = 1;</code></pre>");
    });
  });
});
