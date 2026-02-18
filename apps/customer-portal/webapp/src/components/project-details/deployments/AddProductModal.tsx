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
  Box,
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
import { useCallback, useState, type ChangeEvent, type JSX } from "react";
import type { SelectChangeEvent } from "@wso2/oxygen-ui";

export interface AddProductModalProps {
  open: boolean;
  deploymentId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const INITIAL_FORM = {
  name: "",
  version: "",
  cores: "",
  tps: "0",
  description: "",
  supportStatus: "Active Support",
  updateLevel: "",
  releaseDate: "",
  eolDate: "",
};

const PRODUCT_OPTIONS = [
  "API Manager",
  "Identity Server",
  "Micro Integrator",
  "Streaming",
];

const SUPPORT_STATUS_OPTIONS = ["Active Support", "End of Life", "Deprecated"];

/**
 * Modal for adding a WSO2 product to a deployment environment.
 *
 * @param {AddProductModalProps} props - open, deploymentId, onClose, optional onSuccess/onError.
 * @returns {JSX.Element} The add product modal.
 */
export default function AddProductModal({
  open,
  onClose,
  onSuccess,
  onError,
}: AddProductModalProps): JSX.Element {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    form.name !== "" &&
    form.version.trim() !== "" &&
    form.cores.trim() !== "" &&
    form.tps.trim() !== "" &&
    form.supportStatus !== "" &&
    form.updateLevel.trim() !== "" &&
    form.releaseDate !== "" &&
    form.eolDate !== "";

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    onClose();
  }, [onClose]);

  const handleTextChange =
    (field: keyof typeof INITIAL_FORM) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSelectChange =
    (field: keyof typeof INITIAL_FORM) =>
    (event: SelectChangeEvent<string>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    setIsSubmitting(true);

    // TODO: Integrate actual API hook here
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
      onSuccess?.();
    }, 1000);
  }, [isValid, form, handleClose, onSuccess]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-product-dialog-title"
      aria-describedby="add-product-dialog-description"
    >
      <DialogTitle
        id="add-product-dialog-title"
        sx={{ pr: 6, position: "relative", pb: 0.5 }}
      >
        Add WSO2 Product
        <Typography
          id="add-product-dialog-description"
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontWeight: "normal", fontSize: "0.875rem" }}
        >
          Add a WSO2 product to this deployment environment.
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
        <Box sx={{ mt: 4, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="product-name-label">Product Name *</InputLabel>
            <Select
              labelId="product-name-label"
              id="product-name"
              value={form.name}
              label="Product Name *"
              onChange={handleSelectChange("name")}
              disabled={isSubmitting}
            >
              {PRODUCT_OPTIONS.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            id="product-version"
            label="Version *"
            placeholder="e.g., 4.2.0"
            value={form.version}
            onChange={handleTextChange("version")}
            fullWidth
            size="small"
            disabled={isSubmitting}
          />
          <TextField
            id="product-cores"
            label="Core Count *"
            placeholder="e.g., 8"
            type="number"
            value={form.cores}
            onChange={handleTextChange("cores")}
            fullWidth
            size="small"
            disabled={isSubmitting}
          />
        </Box>

        <TextField
          id="product-tps"
          label="TPS (Transactions Per Second) *"
          placeholder="e.g., 5000"
          type="number"
          value={form.tps}
          onChange={handleTextChange("tps")}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled={isSubmitting}
        />

        <TextField
          id="product-description"
          label="Description"
          placeholder="Optional description..."
          value={form.description}
          onChange={handleTextChange("description")}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={{ mb: 2 }}
          disabled={isSubmitting}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="product-support-status-label">
              Support Status *
            </InputLabel>
            <Select
              labelId="product-support-status-label"
              id="product-support-status"
              value={form.supportStatus}
              label="Support Status *"
              onChange={handleSelectChange("supportStatus")}
              disabled={isSubmitting}
            >
              {SUPPORT_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            id="product-update-level"
            label="Current Update Level *"
            placeholder="e.g., U22"
            value={form.updateLevel}
            onChange={handleTextChange("updateLevel")}
            fullWidth
            size="small"
            disabled={isSubmitting}
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            id="product-release-date"
            label="Release Date *"
            type="date"
            value={form.releaseDate}
            onChange={handleTextChange("releaseDate")}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            disabled={isSubmitting}
          />
          <TextField
            id="product-eol-date"
            label="Support EOL Date *"
            type="date"
            value={form.eolDate}
            onChange={handleTextChange("eolDate")}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        {isSubmitting ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CircularProgress color="inherit" size={16} />}
            disabled
          >
            Adding...
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Add Product
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
