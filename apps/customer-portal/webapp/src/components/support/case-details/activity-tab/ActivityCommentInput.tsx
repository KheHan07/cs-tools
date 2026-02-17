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

import { Box, CircularProgress, IconButton } from "@wso2/oxygen-ui";
import { Send } from "@wso2/oxygen-ui-icons-react";
import { useState } from "react";
import { usePostComment } from "@api/usePostComment";
import { useAsgardeo } from "@asgardeo/react";
import { useErrorBanner } from "@context/error-banner/ErrorBannerContext";
import { stripHtml } from "@utils/support";
import Editor from "@components/common/rich-text-editor/Editor";
import type { JSX } from "react";

export interface ActivityCommentInputProps {
  caseId: string;
}

/**
 * Input row with rich-text editor and send button.
 * Uses the shared Editor component and posts comments via usePostComment; on success invalidates and refetches comments.
 *
 * @param {ActivityCommentInputProps} props - caseId for POST.
 * @returns {JSX.Element} The comment input component.
 */
export default function ActivityCommentInput({
  caseId,
}: ActivityCommentInputProps): JSX.Element {
  const [value, setValue] = useState("");
  const [resetTrigger, setResetTrigger] = useState(0);
  const postComment = usePostComment();
  const { isSignedIn, isLoading: isAuthLoading } = useAsgardeo();
  const { showError } = useErrorBanner();

  const isDisabled = !isSignedIn || isAuthLoading || postComment.isPending;

  const handleSend = () => {
    if (stripHtml(value).length === 0 || isDisabled) return;

    postComment.mutate(
      { caseId, body: { content: value.trim() } },
      {
        onSuccess: () => {
          setValue("");
          setResetTrigger((prev) => prev + 1);
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "Failed to post comment. Please try again.";
          showError(message);
        },
      },
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        px: 2,
        py: 1.5,
        flexShrink: 0,
      }}
    >
      <Box sx={{ flex: 1, position: "relative" }}>
        <Editor
          value={value}
          onChange={setValue}
          disabled={isDisabled}
          resetTrigger={resetTrigger}
          minHeight={40}
          showToolbar={true}
          placeholder="Write a comment..."
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            zIndex: 1,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            disabled={stripHtml(value).length === 0 || isDisabled}
            onClick={handleSend}
            color="warning"
            aria-label="Send comment"
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
              boxShadow: 1,
              width: 32,
              height: 32,
            }}
          >
            {postComment.isPending ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <Send size={18} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
