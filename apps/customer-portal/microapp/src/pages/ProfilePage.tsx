// Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com).
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
  AccessTime,
  Assistant,
  Email,
  Lock,
  Logout,
  Notifications,
  Person,
  Phone,
  SmartToy,
} from "@mui/icons-material";
import { useLayout } from "@context/layout";
import { ButtonBase as Button, Card, Divider, Stack, Switch, Typography } from "@mui/material";
import { useLayoutEffect, type ReactNode } from "react";
import { Avatar } from "@components/features/users";
import { SettingListItem } from "@components/features/settings";

export default function ProfilePage() {
  const layout = useLayout();

  const AppBarSlot = () => (
    <Stack direction="row" alignItems="center" gap={1.5} mt={1}>
      <Avatar>Lithika Damnod</Avatar>
      <Stack>
        <Typography variant="h6" fontWeight="medium">
          Lithika Damnod
        </Typography>
        <Typography variant="subtitle2" fontWeight="regular" color="text.secondary">
          Customer since 2024
        </Typography>
      </Stack>
    </Stack>
  );

  useLayoutEffect(() => {
    layout.setAppBarSlotsOverride(<AppBarSlot />);

    return () => {
      layout.setAppBarSlotsOverride(undefined);
    };
  }, []);

  return (
    <Stack gap={2.5}>
      <SectionCard title="Account Information">
        <SettingListItem
          name="Email"
          value="user@example.com"
          iconColor="components.status.waiting.text"
          iconBackgroundColor="components.status.waiting.background"
          icon={Email}
        />
        <SettingListItem
          name="Phone"
          value="+1 (555) 123-4567"
          iconColor="components.status.active.text"
          iconBackgroundColor="components.status.active.background"
          icon={Phone}
        />
        <SettingListItem
          name="Timezone"
          value="Eastern Time (ET) - UTC-5"
          iconColor="components.status.scheduled.text"
          iconBackgroundColor="components.status.scheduled.background"
          icon={AccessTime}
        />
      </SectionCard>

      <SectionCard title="Settings">
        <SettingListItem name="Change Password" suffix="chevron" icon={Lock} />
        <SettingListItem name="Update Profile" suffix="chevron" icon={Person} />
      </SectionCard>

      <SectionCard title="Notifications">
        <SettingListItem
          name="Push Notifications"
          icon={Notifications}
          suffix={<Switch defaultChecked color="default" />}
        />
      </SectionCard>

      <SectionCard title="AI Features">
        <SettingListItem
          name="AI Chat Assistant"
          description="Enable AI-powered chat support"
          iconColor="components.portal.accent.purple"
          icon={SmartToy}
          suffix={<Switch defaultChecked color="default" />}
        />
        <SettingListItem
          name="Smart Knowledge Base"
          description="Get intelligent article suggestions"
          iconColor="components.status.active.text"
          icon={Assistant}
          suffix={<Switch defaultChecked color="default" />}
        />
      </SectionCard>

      <Button variant="outlined" sx={{ bgcolor: "background.paper", color: "error.main", fontWeight: "medium" }}>
        <Logout color="error" />
        Log Out
      </Button>
    </Stack>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={1}>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
      <Card component={Stack} elevation={0} divider={<Divider />}>
        {children}
      </Card>
    </Stack>
  );
}
