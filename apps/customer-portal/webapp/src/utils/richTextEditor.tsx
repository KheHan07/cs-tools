// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React, { type ReactElement } from "react";
import { type Theme } from "@wso2/oxygen-ui";
import {
  File as FileIcon,
  FileArchive,
  FileCode,
  FileImage,
  FileText,
} from "@wso2/oxygen-ui-icons-react";
import { createCommand, type LexicalCommand } from "lexical";

/**
 * Escapes HTML entities in a string.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes a URL by allowing only safe protocols.
 */
const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
export function sanitizeUrl(url: string): string {
  const decoded = url.replace(/&amp;/g, "&");
  return SAFE_URL_PATTERN.test(decoded.trim()) ? url : "";
}

/**
 * Returns the appropriate icon for a file based on its extension or type.
 */
export const getFileIcon = (file: File, theme: Theme): ReactElement => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (
    /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(name) ||
    type.startsWith("image/")
  ) {
    return <FileImage size={16} color={theme.palette.primary.main} />;
  }
  if (/\.pdf$/i.test(name) || type.includes("pdf")) {
    return <FileText size={16} color={theme.palette.primary.main} />;
  }
  if (
    /\.(zip|rar|7z|tar|gz)$/i.test(name) ||
    type.includes("zip") ||
    type.includes("archive")
  ) {
    return <FileArchive size={16} color={theme.palette.primary.main} />;
  }
  if (
    /\.(js|ts|tsx|jsx|py|java|cpp|c|h|cs|go|rs|php|rb|html|css|json|md|xml|yaml|yml|sh|sql)$/i.test(
      name,
    ) ||
    type.includes("code")
  ) {
    return <FileCode size={16} color={theme.palette.primary.main} />;
  }
  if (/\.(txt|log|csv)$/i.test(name) || type.startsWith("text/")) {
    return <FileText size={16} color={theme.palette.primary.main} />;
  }
  return <FileIcon size={16} color={theme.palette.primary.main} />;
};

/**
 * Scrolls an element by a given amount.
 */
export const scrollElement = (
  elementId: string,
  direction: "left" | "right",
  scrollAmount: number = 200,
) => {
  const container = document.getElementById(elementId);
  if (container) {
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }
};

/**
 * Lexical Command for inserting an image.
 */
export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand();
