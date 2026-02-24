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

import { Box } from "@wso2/oxygen-ui";
import { type JSX } from "react";
import SupportStatGrid from "@components/common/stat-grid/SupportStatGrid";
import { ALL_CONVERSATIONS_STAT_CONFIGS } from "@constants/supportConstants";

export interface AllConversationsStatCardsProps {
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * AllConversationsStatCards component to display stat cards (no values yet).
 *
 * @param {AllConversationsStatCardsProps} props - Loading and error state.
 * @returns {JSX.Element} The rendered stat cards grid.
 */
export default function AllConversationsStatCards({
  isLoading = false,
  isError = false,
}: AllConversationsStatCardsProps): JSX.Element {
  return (
    <Box sx={{ mb: 3 }}>
      <SupportStatGrid
        isLoading={isLoading}
        isError={isError}
        entityName="conversation"
        configs={ALL_CONVERSATIONS_STAT_CONFIGS}
        stats={undefined}
      />
    </Box>
  );
}
