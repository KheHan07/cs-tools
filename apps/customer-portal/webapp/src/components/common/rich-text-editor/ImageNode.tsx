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

import {
  DecoratorNode,
  type DOMConversionMap,
  type EditorConfig,
  type LexicalEditor,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import type { JSX } from "react";
import { deriveAltFromFilename, sanitizeUrl } from "@utils/richTextEditor";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  // 1. How Lexical turns JSON back into a Class
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText } = serializedNode;
    return $createImageNode(sanitizeUrl(src), altText);
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    void config;
    return document.createElement("span");
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(editor: LexicalEditor): { element: HTMLElement | null } {
    void editor;
    const img = document.createElement("img");
    img.setAttribute("src", sanitizeUrl(this.__src));
    img.setAttribute("alt", this.__altText);
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    img.style.display = "block";
    return { element: img };
  }

  static importDOM(): DOMConversionMap<HTMLElement> | null {
    return {
      img: () => ({
        conversion: (element: HTMLElement) => {
          const raw = element.getAttribute("src") ?? "";
          const src = sanitizeUrl(raw);
          const alt =
            element.getAttribute("alt") ?? deriveAltFromFilename(raw);
          if (!src) return null;
          return { node: $createImageNode(src, alt) };
        },
        priority: 1,
      }),
    };
  }

  decorate(): JSX.Element {
    return (
      <img
        src={sanitizeUrl(this.__src)}
        alt={this.__altText}
        style={{ maxWidth: "100%", borderRadius: "8px", display: "block" }}
      />
    );
  }
}

export function $createImageNode(src: string, altText: string): ImageNode {
  return new ImageNode(sanitizeUrl(src), altText);
}
