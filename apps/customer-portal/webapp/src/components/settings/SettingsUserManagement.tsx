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

import { useState, useMemo, useCallback, type JSX, type ComponentType } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@wso2/oxygen-ui";
import {
  Code,
  Crown,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
} from "@wso2/oxygen-ui-icons-react";
import { colors } from "@wso2/oxygen-ui";
import useGetProjectContacts from "@api/useGetProjectContacts";
import { usePostProjectContact } from "@api/usePostProjectContact";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";
import { useErrorBanner } from "@context/error-banner/ErrorBannerContext";
import { useSuccessBanner } from "@context/success-banner/SuccessBannerContext";
import AddSettingsUserModal from "@components/settings/AddSettingsUserModal";
import { getUserStatusColor } from "@utils/projectDetails";
import type { ProjectContact } from "@models/responses";
import type { CreateProjectContactRequest } from "@models/requests";

const NULL_PLACEHOLDER = "--";

const ROLE_CONFIG = [
  {
    id: "admin",
    label: "Admin",
    Icon: Crown,
    paletteKey: "secondary" as const,
    permissions: [
      "Full portal access",
      "Manage users and settings",
      "View all cases and requests",
    ],
  },
  {
    id: "developer",
    label: "Developer",
    Icon: Code,
    paletteKey: "info" as const,
    permissions: [
      "Create and manage cases",
      "Access technical resources",
      "View project details",
    ],
  },
  {
    id: "security",
    label: "Security",
    Icon: ShieldCheck,
    paletteKey: "error" as const,
    permissions: [
      "Access security advisories",
      "Create security cases",
      "View vulnerability reports",
    ],
  },
] as const;

function getRoleLabel(contact: ProjectContact): string {
  if (contact.isCsAdmin) return "Admin";
  if (contact.isCsIntegrationUser) return "Developer";
  if (contact.isSecurityContact) return "Security";
  return NULL_PLACEHOLDER;
}

function getRoleIcon(contact: ProjectContact): ComponentType<{ size?: number }> | null {
  if (contact.isCsAdmin) return Crown;
  if (contact.isCsIntegrationUser) return Code;
  if (contact.isSecurityContact) return ShieldCheck;
  return null;
}

function getRoleChipColor(
  contact: ProjectContact,
): "primary" | "info" | "error" | "default" {
  if (contact.isCsAdmin) return "primary";
  if (contact.isCsIntegrationUser) return "info";
  if (contact.isSecurityContact) return "error";
  return "default";
}

function getRoleChipSx(contact: ProjectContact): object {
  const purple = colors.purple?.[600] ?? "#7c3aed";
  const iconPadding = {
    "& .MuiChip-icon": { ml: 0.75, mr: 0.5 },
    "& .MuiChip-label": { pl: 0.5 },
  };
  if (contact.isCsAdmin) {
    return {
      font: "caption",
      color: purple,
      borderColor: purple,
      "& .MuiChip-icon": { ml: 0.75, mr: 0.5, color: purple },
      "& .MuiChip-label": { pl: 0.5 },
    };
  }
  return { font: "caption", ...iconPadding };
}

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    const first = (firstName ?? "").charAt(0).toUpperCase();
    const last = (lastName ?? "").charAt(0).toUpperCase();
    if (first || last) return `${first}${last}`.trim() || NULL_PLACEHOLDER;
  }
  if (email) {
    const parts = email.split("@")[0];
    return parts.length >= 2 ? parts.slice(0, 2).toUpperCase() : parts.toUpperCase();
  }
  return "?";
}

const AVATAR_COLORS = [
  colors.purple?.[600] ?? "#7c3aed",
  colors.blue?.[600] ?? "#2563eb",
  colors.green?.[600] ?? "#16a34a",
  colors.orange?.[600] ?? "#ea580c",
  colors.pink?.[500] ?? "#ec4899",
] as const;

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] as string;
}

export interface SettingsUserManagementProps {
  projectId: string;
}

/**
 * User management section: stat cards, search, table, role permissions.
 *
 * @param {SettingsUserManagementProps} props - Component props.
 * @returns {JSX.Element} The component.
 */
export default function SettingsUserManagement({
  projectId,
}: SettingsUserManagementProps): JSX.Element {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: contacts = [], isFetching, error } = useGetProjectContacts(projectId);
  const postContact = usePostProjectContact(projectId);
  const { showError } = useErrorBanner();
  const { showSuccess } = useSuccessBanner();

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((c) => {
      const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase();
      const email = (c.email ?? "").toLowerCase();
      const role = getRoleLabel(c).toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [contacts, searchQuery]);

  const stats = useMemo(() => ({
    admins: contacts.filter((c) => c.isCsAdmin).length,
    developers: contacts.filter((c) => c.isCsIntegrationUser).length,
    security: contacts.filter((c) => c.isSecurityContact).length,
  }), [contacts]);

  const handleAddUser = useCallback(
    (data: CreateProjectContactRequest) => {
      postContact.mutate(data, {
        onSuccess: () => {
          setIsAddModalOpen(false);
          showSuccess("Invitation sent successfully");
        },
        onError: (err) => {
          showError(err?.message ?? "Failed to add user. Please try again.");
        },
      });
    },
    [postContact, showSuccess, showError],
  );

  const isEffectiveLoading = isFetching || (!contacts.length && !error);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Stat cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.purple?.[600] ?? theme.palette.secondary.main,
                }}
              >
                {isEffectiveLoading ? (
                  <Skeleton variant="circular" width={20} height={20} />
                ) : (
                  <Crown size={20} />
                )}
              </Box>
              <Box>
                <Typography variant="h4">
                  {isEffectiveLoading ? (
                    <Skeleton variant="text" width={24} height={32} />
                  ) : error ? (
                    <ErrorIndicator entityName="admins" size="small" />
                  ) : (
                    stats.admins
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEffectiveLoading ? (
                    <Skeleton variant="text" width={48} height={16} />
                  ) : (
                    "Admins"
                  )}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "info.main",
                }}
              >
                {isEffectiveLoading ? (
                  <Skeleton variant="circular" width={20} height={20} />
                ) : (
                  <Code size={20} />
                )}
              </Box>
              <Box>
                <Typography variant="h4">
                  {isEffectiveLoading ? (
                    <Skeleton variant="text" width={24} height={32} />
                  ) : error ? (
                    <ErrorIndicator entityName="developers" size="small" />
                  ) : (
                    stats.developers
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEffectiveLoading ? (
                    <Skeleton variant="text" width={64} height={16} />
                  ) : (
                    "Developers"
                  )}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "error.main",
                }}
              >
                {isEffectiveLoading ? (
                  <Skeleton variant="circular" width={20} height={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </Box>
              <Box>
                <Typography variant="h4">
                  {isEffectiveLoading ? (
                    <Skeleton variant="text" width={24} height={32} />
                  ) : error ? (
                    <ErrorIndicator entityName="security" size="small" />
                  ) : (
                    stats.security
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEffectiveLoading ? (
                    <Skeleton variant="text" width={56} height={16} />
                  ) : (
                    "Security"
                  )}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Add User */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="warning"
          startIcon={<Plus size={18} />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{ whiteSpace: "nowrap" }}
        >
          Add User
        </Button>
      </Box>

      {/* Users table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notifications</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box>
                        <Skeleton variant="text" width={100} height={20} />
                        <Skeleton variant="text" width={140} height={16} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <ErrorIndicator entityName="users" size="medium" />
                </TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact, idx) => (
                <TableRow key={contact.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: getAvatarColor(idx),
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          typography: "body2",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(contact.firstName, contact.lastName, contact.email)}
                      </Box>
                      <Box>
                        <Typography variant="body2">
                          {contact.firstName && contact.lastName
                            ? `${contact.firstName} ${contact.lastName}`
                            : contact.firstName || contact.lastName || NULL_PLACEHOLDER}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contact.email ?? NULL_PLACEHOLDER}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const RoleIcon = getRoleIcon(contact);
                      const label = getRoleLabel(contact);
                      return (
                        <Chip
                          size="small"
                          icon={RoleIcon ? <RoleIcon size={12} /> : undefined}
                          label={label}
                          variant="outlined"
                          color={getRoleChipColor(contact)}
                          sx={RoleIcon ? getRoleChipSx(contact) : { font: "caption" }}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={contact.membershipStatus ?? NULL_PLACEHOLDER}
                      variant="outlined"
                      color={getUserStatusColor(contact.membershipStatus ?? "")}
                      sx={{ font: "caption" }}
                    />
                  </TableCell>
                  <TableCell>{NULL_PLACEHOLDER}</TableCell>
                  <TableCell>{NULL_PLACEHOLDER}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" aria-label="Edit user">
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" color="error" aria-label="Remove user">
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Permissions */}
      <Paper
        sx={{
          p: 2.5,
          bgcolor: alpha(theme.palette.info.main, 0.06),
          border: "1px solid",
          borderColor: alpha(theme.palette.info.main, 0.2),
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Shield size={20} color={theme.palette.info.main} />
          Role Permissions
        </Typography>
        <Grid container spacing={2}>
          {ROLE_CONFIG.map((role) => {
            const RoleIcon = role.Icon;
            const roleColor =
              role.paletteKey === "secondary"
                ? (colors.purple?.[600] ?? theme.palette.primary.main)
                : (theme.palette[role.paletteKey]?.main ?? theme.palette.text.primary);
            return (
              <Grid key={role.id} size={{ xs: 12, md: 4 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <RoleIcon size={18} color={roleColor} />
                    <Typography variant="subtitle2">{role.label}</Typography>
                  </Box>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: "disc", "& li": { mb: 0.5 } }}>
                    {role.permissions.map((p) => (
                      <li key={p}>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {p}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <AddSettingsUserModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        isSubmitting={postContact.isPending}
      />
    </Box>
  );
}
