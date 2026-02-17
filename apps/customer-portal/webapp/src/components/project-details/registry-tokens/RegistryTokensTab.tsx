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

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus, RefreshCw, Trash } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import { getTokenStatusColor } from "@utils/projectStats";
import type { MockRegistryToken } from "@models/mockData";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";
import useGetRegistryTokens from "@api/useGetRegistryTokens";
import GenerateTokenDialog from "@components/project-details/registry-tokens/GenerateTokenDialog";
import TokenSecretDialog from "@components/project-details/registry-tokens/TokenSecretDialog";
import { USER_ROLES } from "@constants/projectDetailsConstants";

interface RegistryTokensTabProps {
  projectId: string;
  userRole?: string;
}

// Column definitions for role-based rendering
const ADMIN_COLUMNS = [
  { id: "tokenName", label: "Token Name" },
  { id: "subscriptionEndDate", label: "Subscription End Date" },
  { id: "products", label: "Products" },
  { id: "tokenType", label: "Token Type" },
  { id: "createdFor", label: "Created For" },
  { id: "createdByEmail", label: "Created By" },
  { id: "createdOn", label: "Created On" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions", align: "right" as const },
];

const USER_COLUMNS = [
  { id: "tokenName", label: "Token Name" },
  { id: "subscriptionEndDate", label: "Subscription End Date" },
  { id: "products", label: "Products" },
  { id: "createdOn", label: "Created On" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions", align: "right" as const },
];

/**
 * RegistryTokensTab component displays registry tokens with role-based columns.
 * Admin users see all 9 columns, regular users see 6 columns.
 *
 * @param {RegistryTokensTabProps} props - The props for the component.
 * @returns {JSX.Element} The RegistryTokensTab component.
 */
export default function RegistryTokensTab({
  projectId,
  userRole = USER_ROLES.USER,
}: RegistryTokensTabProps): JSX.Element {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] =
    useState<boolean>(false);
  const [isSecretDialogOpen, setIsSecretDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] =
    useState<boolean>(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<{
    name: string;
    secret: string;
  } | null>(null);
  const [localTokens, setLocalTokens] = useState<MockRegistryToken[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  const {
    data: fetchedTokens,
    isFetching,
    error,
  } = useGetRegistryTokens(projectId);

  const isAdmin = userRole === USER_ROLES.ADMIN;
  const columns = isAdmin ? ADMIN_COLUMNS : USER_COLUMNS;

  // Reset local state when projectId changes
  useEffect(() => {
    setLocalTokens([]);
    setInitialized(false);
  }, [projectId]);

  // Sync fetched data to local state
  useEffect(() => {
    if (fetchedTokens && !initialized) {
      setLocalTokens(fetchedTokens);
      setInitialized(true);
    }
  }, [fetchedTokens, initialized]);

  const tokens = initialized ? localTokens : (fetchedTokens ?? []);

  const handleDeleteClick = (tokenId: string): void => {
    setSelectedTokenId(tokenId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (): void => {
    if (selectedTokenId) {
      // TODO: Replace with actual API call to delete token
      setLocalTokens((prevTokens) =>
        prevTokens.filter((token) => token.id !== selectedTokenId),
      );
    }
    setIsDeleteDialogOpen(false);
    setSelectedTokenId(null);
  };

  const handleRegenerateClick = (tokenId: string): void => {
    setSelectedTokenId(tokenId);
    setIsRegenerateDialogOpen(true);
  };

  const handleConfirmRegenerate = (): void => {
    if (selectedTokenId) {
      // TODO: Replace with actual API call to regenerate secret
      const token = tokens.find((t) => t.id === selectedTokenId);
      if (token) {
        const newSecret = `regenerated-secret-${Date.now()}`;
        setGeneratedToken({ name: token.tokenName, secret: newSecret });
        setIsSecretDialogOpen(true);
      }
    }
    setIsRegenerateDialogOpen(false);
    setSelectedTokenId(null);
  };

  const handleGenerateToken = (data: {
    tokenName: string;
    tokenType: string;
    serviceUser?: string;
  }): void => {
    // TODO: Replace with actual API call to generate token
    const newToken: MockRegistryToken = {
      id: Date.now().toString(),
      tokenName: data.tokenName,
      subscriptionEndDate: "2027-12-31",
      products: ["API Manager"],
      tokenType: data.tokenType as "User" | "Service",
      createdFor: data.serviceUser || "current-user@company.com",
      createdByEmail: "current-user@company.com",
      createdOn: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setLocalTokens((prevTokens) => [...prevTokens, newToken]);
    setIsGenerateDialogOpen(false);

    // Generate mock secret and show secret dialog
    const mockSecret = `wso2-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setGeneratedToken({ name: data.tokenName, secret: mockSecret });
    setIsSecretDialogOpen(true);
  };

  const renderTableSkeleton = (): JSX.Element => (
    <>
      {[1, 2, 3].map((row) => (
        <TableRow key={row}>
          {columns.map((col) => (
            <TableCell key={col.id}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  const renderCellContent = (
    token: MockRegistryToken,
    columnId: string,
  ): JSX.Element | string => {
    switch (columnId) {
      case "tokenName":
        return token.tokenName;
      case "subscriptionEndDate":
        return token.subscriptionEndDate;
      case "products":
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {token.products.map((product) => (
              <Chip
                key={product}
                label={product}
                size="small"
                variant="outlined"
                sx={{ font: "caption" }}
              />
            ))}
          </Box>
        );
      case "tokenType":
        return (
          <Chip
            label={token.tokenType}
            size="small"
            variant="outlined"
            color={token.tokenType === "Service" ? "info" : "default"}
            sx={{ font: "caption" }}
          />
        );
      case "createdFor":
        return token.createdFor;
      case "createdByEmail":
        return token.createdByEmail;
      case "createdOn":
        return token.createdOn;
      case "status":
        return (
          <Chip
            label={token.status}
            size="small"
            variant="outlined"
            color={getTokenStatusColor(token.status)}
            sx={{ font: "caption" }}
          />
        );
      case "actions":
        return (
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            <Tooltip title="Regenerate Secret">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleRegenerateClick(token.id)}
              >
                <RefreshCw size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Token">
              <IconButton
                color="error"
                size="small"
                onClick={() => handleDeleteClick(token.id)}
              >
                <Trash size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      default:
        return "";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Registry Tokens</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
          onClick={() => setIsGenerateDialogOpen(true)}
        >
          Generate Token
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching ? (
              renderTableSkeleton()
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <ErrorIndicator entityName="registry tokens" />
                </TableCell>
              </TableRow>
            ) : tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    No registry tokens found for this project.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id}>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align}>
                      {renderCellContent(token, col.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Token Dialog */}
      <GenerateTokenDialog
        open={isGenerateDialogOpen}
        onClose={() => setIsGenerateDialogOpen(false)}
        onGenerate={handleGenerateToken}
        userRole={userRole}
        projectId={projectId}
      />

      {/* Token Secret Dialog */}
      {generatedToken && (
        <TokenSecretDialog
          open={isSecretDialogOpen}
          onClose={() => {
            setIsSecretDialogOpen(false);
            setGeneratedToken(null);
          }}
          tokenName={generatedToken.name}
          tokenSecret={generatedToken.secret}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTokenId(null);
        }}
      >
        <DialogTitle>Delete Token</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this token? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedTokenId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete Token
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regenerate Secret Confirmation Dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={isRegenerateDialogOpen}
        onClose={() => {
          setIsRegenerateDialogOpen(false);
          setSelectedTokenId(null);
        }}
      >
        <DialogTitle>Regenerate Token Secret</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to regenerate the token secret? This will
            invalidate the current secret.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsRegenerateDialogOpen(false);
              setSelectedTokenId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={handleConfirmRegenerate}
          >
            Regenerate Secret
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}