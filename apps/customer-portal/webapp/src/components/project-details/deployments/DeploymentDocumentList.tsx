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
import { formatProjectDate, formatBytes } from "@utils/projectDetails";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
  alpha,
} from "@wso2/oxygen-ui";
import { ChevronDown, Download, Trash2 } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";

interface DeploymentDocumentListProps {
  documents: DeploymentDocument[];
}

/**
 * Renders the list of documents for a deployment.
 *
 * @param {DeploymentDocumentListProps} props - Props containing the documents list.
 * @returns {JSX.Element} The document list component.
 */
export default function DeploymentDocumentList({
  documents,
}: DeploymentDocumentListProps): JSX.Element {
  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography>Documents ({documents.length})</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {documents.length === 0 ? (
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
    </Box>
  );
}

interface DocumentRowProps {
  doc: DeploymentDocument;
}

function DocumentRow({ doc }: DocumentRowProps): JSX.Element {
  const sizeStr = formatBytes(doc.sizeBytes);
  const dateStr = formatProjectDate(doc.uploadedAt);

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
            {doc.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sizeStr} • Uploaded {dateStr} • {doc.uploadedBy}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button size="small" aria-label={`Download ${doc.name}`}>
          <Download size={16} />
        </Button>
        <Button size="small" aria-label={`Delete ${doc.name}`}>
          <Trash2 size={16} />
        </Button>
      </Box>
    </Box>
  );
}
