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
  IconButton,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { X } from "@wso2/oxygen-ui-icons-react";
import { useCallback, useEffect, useState, type ChangeEvent, type JSX } from "react";
import { usePatchDeploymentProduct } from "@api/usePatchDeploymentProduct";
import type { DeploymentProductItem } from "@models/responses";

export interface ManageProductModalProps {
  open: boolean;
  deploymentId: string;
  product: DeploymentProductItem | null;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

/**
 * Modal for managing (editing) a deployment product.
 * Product Details tab: Core Count and TPS editable; Description disabled.
 * Update History tab disabled.
 *
 * @param {ManageProductModalProps} props - open, deploymentId, product, onClose, optional onSuccess/onError.
 * @returns {JSX.Element | null} The manage product modal or null when product is missing.
 */
export default function ManageProductModal({
  open,
  deploymentId,
  product,
  onClose,
  onSuccess,
  onError,
}: ManageProductModalProps): JSX.Element | null {
  const [tabValue, setTabValue] = useState(0);
  const [cores, setCores] = useState("");
  const [tps, setTps] = useState("");

  const patchProduct = usePatchDeploymentProduct();
  const isSubmitting = patchProduct.isPending;

  useEffect(() => {
    if (open && product) {
      setCores(
        typeof product.cores === "number" ? String(product.cores) : "",
      );
      setTps(typeof product.tps === "number" ? String(product.tps) : "");
      setTabValue(0);
    }
  }, [open, product]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleTabChange = useCallback((_e: unknown, v: number) => {
    if (v === 0) setTabValue(0);
    // Tab 1 (Update History) is disabled, do not switch
  }, []);

  const handleCoresChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCores(e.target.value);
  }, []);

  const handleTpsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTps(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    if (!product?.id) return;

    try {
      await patchProduct.mutateAsync({
        deploymentId,
        productId: product.id,
        body: {
          cores: cores.trim() ? Number(cores) : undefined,
          tps: tps.trim() ? Number(tps) : undefined,
        },
      });
      handleClose();
      onSuccess?.();
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to update product",
      );
    }
  }, [
    product?.id,
    deploymentId,
    cores,
    tps,
    patchProduct,
    handleClose,
    onSuccess,
    onError,
  ]);

  if (!product) return null;

  const description = product.description ?? "";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="manage-product-dialog-title"
      aria-describedby="manage-product-dialog-description"
    >
      <DialogTitle
        id="manage-product-dialog-title"
        sx={{ pr: 6, position: "relative", pb: 0.5 }}
      >
        Manage Product
        <Typography
          id="manage-product-dialog-description"
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontWeight: "normal", fontSize: "0.875rem" }}
        >
          Update product details and manage update history
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
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 2, minHeight: 36 }}
        >
          <Tab label="Product Details" id="manage-product-tab-details" />
          <Tab
            label="Update History"
            id="manage-product-tab-history"
            disabled
          />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              id="manage-product-description"
              label="Description"
              placeholder="Brief description about the product..."
              value={description}
              fullWidth
              size="small"
              multiline
              rows={3}
              disabled
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              <TextField
                id="manage-product-cores"
                label="Core Count"
                placeholder="e.g., 8"
                type="number"
                value={cores}
                onChange={handleCoresChange}
                fullWidth
                size="small"
                disabled={isSubmitting}
                inputProps={{ min: 0 }}
              />
              <TextField
                id="manage-product-tps"
                label="TPS"
                placeholder="e.g., 5000"
                type="number"
                value={tps}
                onChange={handleTpsChange}
                fullWidth
                size="small"
                disabled={isSubmitting}
                inputProps={{ min: 0 }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}
      >
        <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
          Close
        </Button>
        {isSubmitting ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CircularProgress color="inherit" size={16} />}
            disabled
          >
            Saving...
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
