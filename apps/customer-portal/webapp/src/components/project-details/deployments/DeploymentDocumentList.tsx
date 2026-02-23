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

import type { DeploymentDocument } from "@models/responses";
import { displayValue, formatProjectDate, formatBytes } from "@utils/projectDetails";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Typography,
  alpha,
} from "@wso2/oxygen-ui";
import { ChevronDown, Download, Trash2, Upload } from "@wso2/oxygen-ui-icons-react";
import { useState, type JSX } from "react";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";
import UploadAttachmentModal from "@case-details-attachments/UploadAttachmentModal";
import { useGetDeploymentDocuments } from "@api/useGetDeploymentDocuments";
import { useQueryClient } from "@tanstack/react-query";
import { ApiQueryKeys } from "@constants/apiConstants";

interface DeploymentDocumentListProps {
  deploymentId: string;
}

/**
 * Renders the list of documents for a deployment with Add Document button.
 *
 * @param {DeploymentDocumentListProps} props - Props containing deploymentId.
 * @returns {JSX.Element} The document list component.
 */
export default function DeploymentDocumentList({
  deploymentId,
}: DeploymentDocumentListProps): JSX.Element {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const {
    data: documents = [],
    isLoading,
    isError: hasError,
  } = useGetDeploymentDocuments(deploymentId);

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    queryClient.invalidateQueries({
      queryKey: [ApiQueryKeys.DEPLOYMENT_ATTACHMENTS, deploymentId],
    });
  };

  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography>
            Documents {hasError ? "(?)" : isLoading ? "…" : `(${documents.length})`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Upload size={16} aria-hidden />}
              sx={{ height: 32, fontSize: "0.75rem" }}
              onClick={() => setIsAddModalOpen(true)}
            >
              Upload
            </Button>
          </Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : hasError ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
              <ErrorIndicator entityName="documents" size="small" />
              <Typography variant="body2" color="text.secondary">
                Failed to load documents
              </Typography>
            </Box>
          ) : documents.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: "center" }}
            >
              No documents uploaded
            </Typography>
          ) : (
            documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
          )}
        </AccordionDetails>
      </Accordion>

      <UploadAttachmentModal
        open={isAddModalOpen}
        deploymentId={deploymentId}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </Box>
  );
}

interface DocumentRowProps {
  doc: DeploymentDocument;
}

function DocumentRow({ doc }: DocumentRowProps): JSX.Element {
  const sizeBytes = doc.sizeBytes ?? doc.size ?? 0;
  const dateStr = formatProjectDate(doc.uploadedAt ?? doc.createdOn ?? "");
  const name = displayValue(doc.name);
  const uploadedBy = displayValue(doc.uploadedBy ?? doc.createdBy);
  const sizeStr = formatBytes(sizeBytes);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: 2,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sizeStr} • Uploaded {dateStr} • {uploadedBy}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        {doc.downloadUrl ? (
          <Button
            component="a"
            href={doc.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            aria-label={`Download ${name}`}
          >
            <Download size={16} />
          </Button>
        ) : (
          <Button size="small" aria-label={`Download ${name}`} disabled>
            <Download size={16} />
          </Button>
        )}
        <Button size="small" aria-label={`Delete ${name}`}>
          <Trash2 size={16} />
        </Button>
      </Box>
    </Box>
  );
}
