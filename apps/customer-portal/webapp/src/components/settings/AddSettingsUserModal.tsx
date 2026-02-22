// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License
// at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { useState, useCallback, useEffect, type JSX } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  InputLabel,
  Typography,
} from "@wso2/oxygen-ui";
import { ChevronDown, Code, ShieldCheck, X } from "@wso2/oxygen-ui-icons-react";
import type { CreateProjectContactRequest } from "@models/requests";

export type ContactRole = "developer" | "security";

const ROLES: { id: ContactRole; label: string; Icon: typeof Code }[] = [
  { id: "developer", label: "Developer", Icon: Code },
  { id: "security", label: "Security", Icon: ShieldCheck },
];

export interface AddSettingsUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectContactRequest) => void;
  isSubmitting?: boolean;
}

/**
 * Modal to add a new user (contact) to the project.
 *
 * @param {AddSettingsUserModalProps} props - Modal props.
 * @returns {JSX.Element} The modal.
 */
export default function AddSettingsUserModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddSettingsUserModalProps): JSX.Element {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ContactRole>("developer");
  const [roleOpen, setRoleOpen] = useState(false);

  const resetForm = useCallback(() => {
    setFullName("");
    setEmail("");
    setRole("developer");
    setRoleOpen(false);
  }, []);

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, resetForm, onClose]);

  const handleSubmit = useCallback(() => {
    const trimmed = fullName.trim();
    const parts = trimmed ? trimmed.split(/\s+/, 2) : [];
    const firstName = parts[0] || "";
    const lastName = parts[1] ?? "";

    if (!email.trim() || !firstName) return;

    onSubmit({
      contactEmail: email.trim(),
      contactFirstName: firstName,
      contactLastName: lastName,
      isCsIntegrationUser: role === "developer",
      isSecurityContact: role === "security",
    });
    // Parent closes modal on success; reset when modal closes (handleClose)
  }, [fullName, email, role, onSubmit]);

  const isValid = fullName.trim().length > 0 && email.trim().length > 0;
  const selectedRole = ROLES.find((r) => r.id === role);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-user-modal-title"
      aria-describedby="add-user-modal-description"
      slotProps={{
        paper: { sx: { position: "relative" } },
      }}
    >
      <IconButton
        aria-label="Close"
        size="small"
        onClick={handleClose}
        disabled={isSubmitting}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          zIndex: 1,
        }}
      >
        <X size={18} />
      </IconButton>
      <DialogTitle id="add-user-modal-title">Add New User</DialogTitle>
      <DialogContent>
        <Typography
          id="add-user-modal-description"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Send an invitation to a new user to access the portal
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <InputLabel
              htmlFor="add-user-fullname"
              sx={{ display: "block", mb: 1, fontSize: "0.875rem" }}
            >
              Full Name <span style={{ color: "var(--oxygen-palette-error-main)" }}>*</span>
            </InputLabel>
            <Input
              id="add-user-fullname"
              fullWidth
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
          </Box>

          <Box>
            <InputLabel
              htmlFor="add-user-email"
              sx={{ display: "block", mb: 1, fontSize: "0.875rem" }}
            >
              Email Address <span style={{ color: "var(--oxygen-palette-error-main)" }}>*</span>
            </InputLabel>
            <Input
              id="add-user-email"
              type="email"
              fullWidth
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </Box>

          <Box>
            <InputLabel sx={{ display: "block", mb: 1, fontSize: "0.875rem" }}>
              Role <span style={{ color: "var(--oxygen-palette-error-main)" }}>*</span>
            </InputLabel>
            <Button
              variant="outlined"
              fullWidth
              endIcon={<ChevronDown size={16} />}
              onClick={() => setRoleOpen(!roleOpen)}
              disabled={isSubmitting}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
              }}
            >
              {selectedRole && (() => {
                const RoleIcon = selectedRole.Icon;
                return (
                  <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleIcon size={16} />
                    {selectedRole.label}
                  </Box>
                );
              })()}
            </Button>
            {roleOpen && (
              <Box
                sx={{
                  mt: 0.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {ROLES.map((r) => {
                  const RoleIcon = r.Icon;
                  return (
                    <Button
                      key={r.id}
                      fullWidth
                      variant="text"
                      onClick={() => {
                        setRole(r.id);
                        setRoleOpen(false);
                      }}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                      }}
                    >
                      <RoleIcon size={16} style={{ marginRight: 8 }} />
                      {r.label}
                    </Button>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Invitation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
