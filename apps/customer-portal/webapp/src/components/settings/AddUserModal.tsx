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
// software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { useState, useCallback, useEffect, useRef, type JSX } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@wso2/oxygen-ui";
import { Code, ShieldCheck, X } from "@wso2/oxygen-ui-icons-react";
import type { SelectChangeEvent } from "@wso2/oxygen-ui";
import type { CreateProjectContactRequest } from "@models/requests";

export type ContactRole = "developer" | "security";

const ROLES: { id: ContactRole; label: string; Icon: typeof Code }[] = [
  { id: "developer", label: "Developer", Icon: Code },
  { id: "security", label: "Security", Icon: ShieldCheck },
];

/** Basic email format validation: local@domain.tld */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectContactRequest) => void;
  isSubmitting?: boolean;
}

/**
 * Modal to add a new user (contact) to the project.
 *
 * @param {AddUserModalProps} props - Modal props.
 * @returns {JSX.Element} The modal.
 */
export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddUserModalProps): JSX.Element {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [role, setRole] = useState<ContactRole>("developer");
  const emailInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setFullName("");
    setEmail("");
    setEmailError("");
    setRole("developer");
  }, []);

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, resetForm, onClose]);

  /** Parses full name into firstName and lastName; preserves multi-word surnames. */
  const parseName = useCallback((trimmed: string): { firstName: string; lastName: string } => {
    if (!trimmed) return { firstName: "", lastName: "" };
    const firstSpaceIdx = trimmed.indexOf(" ");
    if (firstSpaceIdx === -1) return { firstName: trimmed, lastName: "" };
    return {
      firstName: trimmed.slice(0, firstSpaceIdx),
      lastName: trimmed.slice(firstSpaceIdx + 1),
    };
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = fullName.trim();
    const { firstName, lastName } = parseName(trimmed);
    const trimmedEmail = email.trim();

    setEmailError("");
    if (!trimmedEmail || !firstName) return;
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter a valid email address (e.g. user@company.com)");
      emailInputRef.current?.focus();
      return;
    }

    onSubmit({
      contactEmail: trimmedEmail,
      contactFirstName: firstName,
      contactLastName: lastName,
      isCsIntegrationUser: role === "developer",
      isSecurityContact: role === "security",
    });
  }, [fullName, email, role, onSubmit, parseName]);

  const isValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim());
  const selectedRole = ROLES.find((r) => r.id === role);

  const handleRoleChange = useCallback((event: SelectChangeEvent<ContactRole>) => {
    setRole(event.target.value as ContactRole);
  }, []);

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
              ref={emailInputRef}
              id="add-user-email"
              type="email"
              fullWidth
              placeholder="user@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              disabled={isSubmitting}
              error={!!emailError}
              slotProps={{
                input: {
                  "aria-invalid": !!emailError,
                  "aria-errormessage": emailError ? "add-user-email-error" : undefined,
                },
              }}
            />
            {emailError && (
              <Typography
                id="add-user-email-error"
                variant="caption"
                color="error"
                sx={{ display: "block", mt: 0.5 }}
              >
                {emailError}
              </Typography>
            )}
          </Box>

          <FormControl fullWidth size="medium">
            <InputLabel id="add-user-role-label">Role</InputLabel>
            <Select<ContactRole>
              labelId="add-user-role-label"
              id="add-user-role"
              value={role}
              label="Role"
              onChange={handleRoleChange}
              disabled={isSubmitting}
              renderValue={() => {
                const RoleIcon = selectedRole?.Icon;
                return RoleIcon ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleIcon size={16} />
                    {selectedRole?.label ?? role}
                  </Box>
                ) : (
                  role
                );
              }}
            >
              {ROLES.map((r) => {
                const RoleIcon = r.Icon;
                return (
                  <MenuItem key={r.id} value={r.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <RoleIcon size={16} />
                      {r.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
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
