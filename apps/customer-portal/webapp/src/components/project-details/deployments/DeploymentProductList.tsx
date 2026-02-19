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

import { type DeploymentProductItem } from "@models/responses";
import { displayValue, formatProjectDate } from "@utils/projectDetails";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Typography,
  alpha,
} from "@wso2/oxygen-ui";
import {
  Calendar,
  CircleAlert,
  Cpu,
  Package,
  Plus,
  Trash2,
  Zap,
} from "@wso2/oxygen-ui-icons-react";
import { useState, type JSX } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDeploymentsProducts } from "@api/useGetDeploymentsProducts";
import { ApiQueryKeys } from "@constants/apiConstants";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";
import AddProductModal from "@components/project-details/deployments/AddProductModal";

interface DeploymentProductListProps {
  deploymentId: string;
}

/**
 * Renders the list of products for a deployment.
 *
 * @param {DeploymentProductListProps} props - Props containing deploymentId.
 * @returns {JSX.Element} The product list component.
 */
export default function DeploymentProductList({
  deploymentId,
}: DeploymentProductListProps): JSX.Element {
  const queryClient = useQueryClient();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const { data: products = [], isLoading, isError } =
    useGetDeploymentsProducts(deploymentId);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Package size={16} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            WSO2 Products {isLoading ? "" : `(${products.length})`}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Plus />}
          sx={{ height: 32, fontSize: "0.75rem" }}
          onClick={() => setIsAddProductModalOpen(true)}
        >
          Add Product
        </Button>
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : isError ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <ErrorIndicator entityName="products" size="small" />
          <Typography variant="body2" color="text.secondary">
            Failed to load products
          </Typography>
        </Box>
      ) : products.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 2, textAlign: "center" }}
        >
          No products added yet
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {products.map((item) => (
            <ProductItemRow key={item.id} item={item} />
          ))}
        </Box>
      )}

      <AddProductModal
        open={isAddProductModalOpen}
        deploymentId={deploymentId}
        onClose={() => setIsAddProductModalOpen(false)}
        onSuccess={() => {
          setIsAddProductModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: [ApiQueryKeys.DEPLOYMENT_PRODUCTS, deploymentId],
          });
        }}
      />
    </Box>
  );
}

interface ProductItemRowProps {
  item: DeploymentProductItem;
}

function ProductItemRow({ item }: ProductItemRowProps): JSX.Element {
  const name = displayValue(item.product?.label);
  const version = displayValue(item.version);
  const description = displayValue(item.description);
  const coresStr =
    typeof item.cores === "number" ? String(item.cores) : displayValue(null);
  const tpsStr =
    typeof item.tps === "number"
      ? item.tps.toLocaleString()
      : displayValue(null);
  const releasedStr = item.releasedOn
    ? formatProjectDate(item.releasedOn)
    : displayValue(null);
  const eolStr = item.endOfLifeOn
    ? formatProjectDate(item.endOfLifeOn)
    : displayValue(null);
  const updateLevelStr = displayValue(item.updateLevel);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            flex: 1,
          }}
        >
          <Checkbox
            sx={{ p: 0.5, mt: -0.5 }}
            disabled
            aria-disabled
            aria-label="Batch select (not yet implemented)"
          />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {name}
              </Typography>
              <Chip
                label={version}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.75rem" }}
              />
              <ErrorIndicator entityName="support status" size="small" />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1.5 }}
            >
              {description}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                columnGap: 1,
                rowGap: 1.5,
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexShrink: 0,
                }}
              >
                <Cpu
                  size={12}
                  style={{ display: "block", flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{ whiteSpace: "nowrap", lineHeight: 1 }}
                >
                  {coresStr} cores
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  flexShrink: 0,
                }}
              >
                <Zap
                  size={12}
                  style={{ display: "block", flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{ whiteSpace: "nowrap", lineHeight: 1 }}
                >
                  {tpsStr} TPS
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  flexShrink: 0,
                }}
              >
                <Calendar
                  size={12}
                  style={{ display: "block", flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{ whiteSpace: "nowrap", lineHeight: 1 }}
                >
                  Released: {releasedStr}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  flexShrink: 0,
                }}
              >
                <CircleAlert
                  size={12}
                  style={{ display: "block", flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{ whiteSpace: "nowrap", lineHeight: 1 }}
                >
                  EOL: {eolStr}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1.5,
              }}
            >
              <Chip
                label={`Update Level: ${updateLevelStr}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: "0.75rem",
                  color: "text.primary",
                }}
              />
            </Box>
          </Box>
        </Box>
        <Button
          size="small"
          aria-label={`Delete ${name}`}
          disabled
          aria-disabled
        >
          <Trash2 size={16} />
        </Button>
      </Box>
    </Box>
  );
}
