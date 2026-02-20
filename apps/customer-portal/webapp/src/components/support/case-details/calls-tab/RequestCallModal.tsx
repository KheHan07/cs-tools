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

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { X } from "@wso2/oxygen-ui-icons-react";
import {
  useCallback,
  useState,
  useEffect,
  type JSX,
  type ChangeEvent,
} from "react";
import type { SelectChangeEvent } from "@wso2/oxygen-ui";
import { usePostCallRequest } from "@api/usePostCallRequest";
import { usePatchCallRequest } from "@api/usePatchCallRequest";
import type { CallRequest } from "@models/responses";
import {
  stripCustomerPrefixFromReason,
  utcToDatetimeLocal,
} from "@utils/support";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
];

const INITIAL_FORM = {
  preferredDateTimeLocal: "",
  durationInMinutes: 30,
  notes: "",
};

export interface RequestCallModalProps {
  open: boolean;
  projectId: string;
  caseId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  /** When provided, modal opens in edit mode with pre-filled values. */
  editCall?: CallRequest;
}

/**
 * Converts local datetime string (YYYY-MM-DDTHH:mm) to UTC ISO string for API.
 *
 * @param {string} localValue - Local datetime-local input value.
 * @returns {string} UTC ISO string (e.g. "2026-02-19T10:00:00Z").
 */
function localToUtcIso(localValue: string): string {
  if (!localValue) return "";
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

/**
 * Modal for requesting a call for a case.
 *
 * @param {RequestCallModalProps} props - open, projectId, caseId, onClose, onSuccess, onError.
 * @returns {JSX.Element} The request call modal.
 */
export default function RequestCallModal({
  open,
  projectId,
  caseId,
  onClose,
  onSuccess,
  onError,
  editCall,
}: RequestCallModalProps): JSX.Element {
  const postCallRequest = usePostCallRequest(projectId, caseId);
  const patchCallRequest = usePatchCallRequest(projectId, caseId);
  const postMutate = postCallRequest.mutate;
  const patchMutate = patchCallRequest.mutate;
  const isEdit = !!editCall;

  const [form, setForm] = useState(INITIAL_FORM);

  const stateKeyFromCall =
    editCall && editCall.state?.id != null
      ? parseInt(String(editCall.state.id), 10)
      : 2;
  const stateKey = Number.isNaN(stateKeyFromCall) ? 2 : stateKeyFromCall;

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      return;
    }
    if (editCall) {
      const preferredUtc =
        editCall.preferredTimes?.[0] || editCall.scheduleTime || "";
      setForm({
        preferredDateTimeLocal: utcToDatetimeLocal(preferredUtc),
        durationInMinutes: editCall.durationMin ?? 30,
        notes: stripCustomerPrefixFromReason(editCall.reason || ""),
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [open, editCall]);

  const isPending = postCallRequest.isPending || patchCallRequest.isPending;
  const isValid =
    form.preferredDateTimeLocal.trim() !== "" &&
    (isEdit || form.durationInMinutes > 0);

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    onClose();
  }, [onClose]);

  const handleTextChange =
    (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleDurationChange = (event: SelectChangeEvent<number>) => {
    setForm((prev) => ({
      ...prev,
      durationInMinutes: Number(event.target.value),
    }));
  };

  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    const utcTimes = [localToUtcIso(form.preferredDateTimeLocal)].filter(
      Boolean,
    );
    if (utcTimes.length === 0) {
      onError?.("Invalid preferred time.");
      return;
    }

    const handleError = (error: Error) => {
      onError?.(error.message ?? "Failed to save call request.");
    };

    if (isEdit && editCall) {
      const strippedDisplay = stripCustomerPrefixFromReason(
        editCall.reason || "",
      );
      const reasonUnchanged = form.notes.trim() === strippedDisplay;
      const reasonToSend = reasonUnchanged ? editCall.reason : form.notes.trim();

      patchMutate(
        {
          callRequestId: editCall.id,
          reason: reasonToSend,
          stateKey,
          utcTimes,
        },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
          onError: handleError,
        },
      );
    } else {
      postMutate(
        {
          durationInMinutes: form.durationInMinutes,
          reason: form.notes.trim() || "[CUSTOMER] Call request",
          utcTimes,
        },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
          onError: handleError,
        },
      );
    }
  }, [
    isValid,
    form,
    stateKey,
    isEdit,
    editCall,
    postMutate,
    patchMutate,
    handleClose,
    onSuccess,
    onError,
  ]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="request-call-dialog-title"
      aria-describedby="request-call-dialog-description"
    >
      <DialogTitle
        id="request-call-dialog-title"
        sx={{ pr: 6, position: "relative", pb: 0.5 }}
      >
        {isEdit ? "Edit Call Request" : "Request Call"}
        <Typography
          id="request-call-dialog-description"
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontWeight: "normal", fontSize: "0.875rem" }}
        >
          {isEdit
            ? "Update the preferred time and notes for this call request."
            : "Schedule a call with our support team."}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
          size="small"
        >
          <X size={20} aria-hidden />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          id="preferred-time"
          label="Preferred Time *"
          type="datetime-local"
          value={form.preferredDateTimeLocal}
          onChange={handleTextChange("preferredDateTimeLocal")}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mt: 4, mb: 2 }}
          disabled={isPending}
        />

        {!isEdit && (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="duration-label">Meeting Duration *</InputLabel>
          <Select<number>
            labelId="duration-label"
            id="duration"
            value={form.durationInMinutes}
            label="Meeting Duration *"
            onChange={handleDurationChange}
            disabled={isPending}
          >
            {DURATION_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        )}

        <TextField
          id="additional-notes"
          label="Additional Notes (Optional)"
          placeholder="Any specific topics or questions you'd like to discuss."
          value={form.notes}
          onChange={handleTextChange("notes")}
          fullWidth
          size="small"
          multiline
          rows={3}
          disabled={isPending}
        />
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        {isPending ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CircularProgress color="inherit" size={16} />}
            disabled
          >
            {isEdit ? "Updating..." : "Requesting..."}
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {isEdit ? "Update Call Request" : "Request Call"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
