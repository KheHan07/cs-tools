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

import { type DeploymentProduct } from "@models/responses";
import {
  formatProjectDate,
  getProductSupportStatusColor,
} from "@utils/projectDetails";
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
import type { JSX } from "react";

interface DeploymentProductListProps {
  products: DeploymentProduct[];
}

/**
 * Renders the list of products for a deployment.
 *
 * @param {DeploymentProductListProps} props - Props containing the products list.
 * @returns {JSX.Element} The product list component.
 */
export default function DeploymentProductList({
  products,
}: DeploymentProductListProps): JSX.Element {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Package size={16} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            WSO2 Products ({products.length})
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Plus />}
          sx={{ height: 32, fontSize: "0.75rem" }}
        >
          Add Product
        </Button>
      </Box>
      {products.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 2, textAlign: "center" }}
        >
          No products added yet
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {products.map((product) => (
            <Box
              key={product.id}
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
                  <Checkbox sx={{ p: 0.5, mt: -0.5 }} />
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
                        {product.name}
                      </Typography>
                      <Chip
                        label={product.version}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: "0.75rem",
                        }}
                      />
                      <Chip
                        label={product.supportStatus}
                        size="small"
                        sx={(theme) => {
                          const statusColor = getProductSupportStatusColor(
                            product.supportStatus,
                          );

                          return {
                            height: 20,
                            fontSize: "0.75rem",
                            bgcolor: alpha(
                              (theme.palette as any)[statusColor].main,
                              0.1,
                            ),
                            color: `${statusColor}.main`,
                            fontWeight: 500,
                          };
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1.5 }}
                    >
                      {product.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Cpu size={12} />
                        <Typography variant="caption">
                          {product.cores} cores
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                        }}
                      >
                        <Zap size={12} />
                        <Typography variant="caption">
                          {product.tps ? product.tps.toLocaleString() : 0} TPS
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                        }}
                      >
                        <Calendar size={12} />
                        <Typography variant="caption">
                          Released: {formatProjectDate(product.releasedDate)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                        }}
                      >
                        <CircleAlert size={12} />
                        <Typography variant="caption">
                          EOL: {formatProjectDate(product.endOfLifeDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={`Update Level: ${product.updateLevel}`}
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
                <Button size="small" aria-label={`Delete ${product.name}`}>
                  <Trash2 size={16} />
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
