import { AdminPanelSettingsOutlined, ChevronRight, Email } from "@mui/icons-material";
import { Card, Stack, Avatar as MuiAvatar, Typography, Chip } from "@mui/material";
import { capitalize, stringAvatar } from "@root/src/utils/others";
import { Link } from "react-router-dom";
import type { RoleName } from "./RoleSelector";

export interface UserListItemProps {
  name: string;
  email: string;
  role: RoleName;
  lastActive: string;
}

export function UserListItem({ name, email, role, lastActive }: UserListItemProps) {
  const admin = role === "Admin";

  return (
    <Card
      component={Link}
      elevation={0}
      to="/users/edit"
      state={{ name, email, role: capitalize(role) }}
      sx={{ textDecoration: "none" }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Avatar>{name}</Avatar>
          <Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="body1" fontWeight="medium">
                {name}
              </Typography>
              <Chip size="small" label={capitalize(role)} color={admin ? "error" : "default"} />
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Email sx={(theme) => ({ fontSize: theme.typography.pxToRem(18), color: "text.secondary" })} />
              <Typography variant="subtitle2" fontWeight="regular" color="text.secondary">
                {email}
              </Typography>
            </Stack>
            <Typography variant="subtitle2" fontWeight="regular" color="text.secondary">
              Last Active: {lastActive}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" gap={2}>
          {admin && (
            <AdminPanelSettingsOutlined color="primary" sx={(theme) => ({ fontSize: theme.typography.pxToRem(28) })} />
          )}

          <ChevronRight sx={{ color: "text.tertiary" }} />
        </Stack>
      </Stack>
    </Card>
  );
}

export function Avatar({ children }: { children: string }) {
  return (
    <MuiAvatar
      sx={(theme) => ({
        height: 40,
        width: 40,
        bgcolor: "primary.main",
        fontSize: theme.typography.h5,
        fontWeight: "medium",
      })}
    >
      {stringAvatar(children)}
    </MuiAvatar>
  );
}
