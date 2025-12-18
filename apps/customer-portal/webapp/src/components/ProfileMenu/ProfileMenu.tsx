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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import { LogOut } from "lucide-react";

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  anchorEl,
  open,
  onClose,
  userName,
  userEmail,
  onLogout,
}) => {
  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 200,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#111827" }}
        >
          {userName}
        </Typography>
        {userEmail && (
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            {userEmail}
          </Typography>
        )}
      </Box>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: 1.5, gap: 1.5 }}>
        <ListItemIcon sx={{ minWidth: "auto" }}>
          <LogOut size={18} />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenu;
