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
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@wso2/oxygen-ui";
import { Bot, FileText } from "@wso2/oxygen-ui-icons-react";
import ReactMarkdown from "react-markdown";
import { type JSX } from "react";
import type { Message } from "@pages/NoveraChatPage";

interface ChatMessageBubbleProps {
  message: Message;
  onCreateCase?: () => void;
  isCreateCaseLoading?: boolean;
}

/** Typography mapping for markdown elements (bot messages). */
const markdownComponents: React.ComponentProps<
  typeof ReactMarkdown
>["components"] = {
  h1: ({ children }) => (
    <Typography variant="h6" component="h1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="subtitle1" component="h2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle2" component="h3" sx={{ mt: 1.5, mb: 0.5, fontWeight: 600 }}>
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography variant="body2" component="p" sx={{ mb: 1, lineHeight: 1.6 }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 1 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 1 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography variant="body2" component="li" sx={{ mb: 0.5, lineHeight: 1.6 }}>
      {children}
    </Typography>
  ),
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 600 }}>
      {children}
    </Box>
  ),
  a: ({ href, children }) => (
    <Typography
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="body2"
      sx={{ color: "primary.main", textDecoration: "underline" }}
    >
      {children}
    </Typography>
  ),
};

/**
 * Renders a single chat message bubble.
 *
 * Supports both user and bot messages with appropriate styling,
 * avatar display, markdown formatting for bot messages, and
 * optional Create Case action when actions is not null.
 *
 * @returns The ChatMessageBubble JSX element.
 */
export default function ChatMessageBubble({
  message,
  onCreateCase,
  isCreateCaseLoading = false,
}: ChatMessageBubbleProps): JSX.Element {
  const isUser = message.sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 1.5,
      }}
    >
      {!isUser && (
        <Paper
          sx={{
            width: (theme) => theme.spacing(4),
            height: (theme) => theme.spacing(4),
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bot size={16} color="#C2410C" />
        </Paper>
      )}
      <Box sx={{ maxWidth: "80%" }}>
        <Paper
          sx={{
            p: 2,
            bgcolor: isUser ? "primary.main" : "background.paper",
            color: isUser ? "common.white" : "text.primary",
            borderRadius: (theme) =>
              isUser
                ? `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(0.5)} ${theme.spacing(2)}`
                : `${theme.spacing(0.5)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)}`,
            boxShadow: "none",
            border: "1px solid",
            borderColor: isUser ? "primary.main" : "divider",
          }}
        >
          {isUser ? (
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {message.text}
            </Typography>
          ) : (
            <Box
              sx={{
                "& h1:first-of-type, & h2:first-of-type, & h3:first-of-type, & p:first-of-type":
                  { mt: 0 },
              }}
            >
              <ReactMarkdown components={markdownComponents}>
                {message.text}
              </ReactMarkdown>
            </Box>
          )}
          {!isUser &&
            message.showCreateCaseAction &&
            onCreateCase &&
            (isCreateCaseLoading ? (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  disabled
                  startIcon={<CircularProgress color="inherit" size={14} />}
                >
                  Processing
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Skip the chat and create a support case now
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  onClick={onCreateCase}
                  startIcon={<FileText size={14} />}
                >
                  Create Case
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Skip the chat and create a support case now
                </Typography>
              </Box>
            ))}
        </Paper>
      </Box>
    </Box>
  );
}
