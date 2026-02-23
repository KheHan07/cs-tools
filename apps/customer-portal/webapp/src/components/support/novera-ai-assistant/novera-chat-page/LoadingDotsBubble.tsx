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

import { Box, Paper } from "@wso2/oxygen-ui";
import { Bot } from "@wso2/oxygen-ui-icons-react";
import { type JSX } from "react";

/**
 * Animated loading dots (orange, yellow, orange) for bot response.
 *
 * @returns {JSX.Element} Loading dots chat bubble.
 */
export default function LoadingDotsBubble(): JSX.Element {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5 }}>
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
      <Box sx={{ maxWidth: "80%" }}>
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "warning.main",
                animation: "loadingDotPulse 1.4s ease-in-out infinite both",
                "@keyframes loadingDotPulse": {
                  "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                  "40%": { opacity: 1, transform: "scale(1)" },
                },
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "warning.main",
                animation: "loadingDotPulse 1.4s ease-in-out infinite both",
                animationDelay: "0.2s",
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "warning.main",
                animation: "loadingDotPulse 1.4s ease-in-out infinite both",
                animationDelay: "0.4s",
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
