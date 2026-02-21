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
  Card,
  CardContent,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { ArrowLeft, Send } from "@wso2/oxygen-ui-icons-react";
import { useState, useCallback, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import Editor from "@components/common/rich-text-editor/Editor";
import { htmlToPlainText } from "@utils/richTextEditor";

const ISSUE_PLACEHOLDER =
  "Example: I'm experiencing API Gateway timeout issues in our production environment. The errors started appearing yesterday around 3 PM, and we're seeing 504 errors intermittently...";

/**
 * DescribeIssuePage lets users describe their issue before navigating to chat.
 * On submit, navigates to chat with the description as the initial user message.
 *
 * @returns {JSX.Element} The describe issue page.
 */
export default function DescribeIssuePage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [value, setValue] = useState("");

  const handleBack = useCallback(() => {
    if (projectId) {
      navigate(`/${projectId}/dashboard`);
    } else {
      navigate(-1);
    }
  }, [navigate, projectId]);

  const handleSubmit = useCallback(() => {
    const plainText = htmlToPlainText(value);
    if (!plainText.trim() || !projectId) return;

    navigate(`/${projectId}/support/chat`, {
      state: { initialUserMessage: plainText.trim() },
    });
  }, [value, navigate, projectId]);

  const plainText = htmlToPlainText(value);
  const isSubmitDisabled = !plainText.trim();

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={handleBack}
        sx={{ mb: 3, textTransform: "none", alignSelf: "flex-start" }}
        variant="text"
      >
        Back to Dashboard
      </Button>

      <Card variant="outlined" sx={{ flex: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" sx={{ mb: 1 }} component="h1">
                What can we help you with?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Describe your issue or question in as much detail as you&apos;d
                like. We&apos;ll analyze it and guide you to a solution.
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.primary"
                component="label"
                sx={{ display: "block", mb: 1 }}
              >
                Describe your issue
              </Typography>
              <Editor
                value={value}
                onChange={setValue}
                placeholder={ISSUE_PLACEHOLDER}
                minHeight={250}
                showToolbar
                toolbarVariant="describeIssue"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                Tip: Include details like error messages, when the issue started,
                affected systems, and what you&apos;ve already tried.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="warning"
                startIcon={<Send size={18} />}
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Submit & Get Help
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
