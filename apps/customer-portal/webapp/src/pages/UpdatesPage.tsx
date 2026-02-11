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
import { useParams } from "react-router";
import { useState, type JSX } from "react";
import TabBar from "@components/common/tab-bar/TabBar";
import { UpdatesStatsGrid } from "@components/updates/UpdatesStatsGrid";
import { useGetUpdatesStats } from "@api/useGetUpdatesStats";

const UPDATES_TABS = [
  { id: "my-updates", label: "My Updates" },
  { id: "all", label: "All Updates" },
];

/**
 * UpdatesPage component to display project updates with tab bar and stats.
 *
 * @returns {JSX.Element} The rendered Updates page.
 */
export default function UpdatesPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("my-updates");

  const { data, isLoading, isError } = useGetUpdatesStats(projectId || "");

  return (
    <Box sx={{ width: "100%", pt: 0 }}>
      <TabBar
        tabs={UPDATES_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <UpdatesStatsGrid
        data={data}
        isLoading={isLoading}
        isError={isError}
      />
    </Box>
  );
}
