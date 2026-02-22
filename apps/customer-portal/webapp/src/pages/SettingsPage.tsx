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
// software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { Box, Typography } from "@wso2/oxygen-ui";
import { Bot, Users } from "@wso2/oxygen-ui-icons-react";
import { useParams } from "react-router";
import { useState, type JSX } from "react";
import TabBar from "@components/common/tab-bar/TabBar";
import SettingsAiAssistant from "@components/settings/SettingsAiAssistant";
import SettingsUserManagement from "@components/settings/SettingsUserManagement";

const SETTINGS_TABS = [
  { id: "users", label: "User Management", icon: Users },
  { id: "ai", label: "AI Assistant", icon: Bot },
] as const;

/**
 * Settings page with User Management and AI Assistant tabs.
 *
 * @returns {JSX.Element} The Settings page.
 */
export default function SettingsPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<string>("users");

  if (!projectId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Project not found. Please select a project.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TabBar
        tabs={SETTINGS_TABS.map((t) => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "users" && <SettingsUserManagement projectId={projectId} />}
      {activeTab === "ai" && <SettingsAiAssistant />}
    </Box>
  );
}
