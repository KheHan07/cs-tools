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

import { Box, IconButton } from "@wso2/oxygen-ui";
import { Send } from "@wso2/oxygen-ui-icons-react";
import { type JSX } from "react";
import Editor from "@components/common/rich-text-editor/Editor";
import { htmlToPlainText } from "@utils/richTextEditor";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  resetTrigger?: number;
}

const CHAT_PLACEHOLDER = "Type your message...";

/**
 * Renders the input area for the Novera Chat page with rich text editor.
 * Single line by default, extends on Shift+Enter. Same toolbar as describe-issue.
 *
 * @returns The ChatInput JSX element.
 */
export default function ChatInput({
  inputValue,
  setInputValue,
  onSend,
  isSending = false,
  resetTrigger = 0,
}: ChatInputProps): JSX.Element {
  const plainText = htmlToPlainText(inputValue).trim();
  const isSendDisabled = !plainText || isSending;

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", flexShrink: 0 }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Editor
            id="novera-chat-input-editor"
            value={inputValue}
            onChange={setInputValue}
            placeholder={CHAT_PLACEHOLDER}
            minHeight={40}
            showToolbar
            toolbarVariant="describeIssue"
            onSubmitKeyDown={() => !isSendDisabled && onSend()}
            disabled={isSending}
            resetTrigger={resetTrigger}
          />
        </Box>
        <IconButton
          disabled={isSendDisabled}
          onClick={onSend}
          color="warning"
          sx={{ flexShrink: 0 }}
        >
          <Send size={18} />
        </IconButton>
      </Box>
    </Box>
  );
}
