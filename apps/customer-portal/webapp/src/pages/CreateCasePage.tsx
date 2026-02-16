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

import { Box, Button, Grid } from "@wso2/oxygen-ui";
import { CircleCheck } from "@wso2/oxygen-ui-icons-react";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type FormEvent,
  type JSX,
} from "react";
import { useNavigate, useParams } from "react-router";
import useGetCasesFilters from "@api/useGetCasesFilters";
import useGetProjectDetails from "@api/useGetProjectDetails";
import { useGetProjectDeployments } from "@api/useGetProjectDeployments";
import { useGetDeploymentsProducts } from "@api/useGetDeploymentsProducts";
import { usePostCase } from "@api/usePostCase";
import { usePostAttachments } from "@api/usePostAttachments";
import { useLoader } from "@context/linear-loader/LoaderContext";
import { useErrorBanner } from "@context/error-banner/ErrorBannerContext";
import { useSuccessBanner } from "@context/success-banner/SuccessBannerContext";
import { useMockConfig } from "@providers/MockConfigProvider";
import type { CreateCaseRequest } from "@models/requests";
import { BasicInformationSection } from "@components/support/case-creation-layout/form-sections/basic-information-section/BasicInformationSection";
import { CaseCreationHeader } from "@components/support/case-creation-layout/header/CaseCreationHeader";
import { CaseDetailsSection } from "@components/support/case-creation-layout/form-sections/case-details-section/CaseDetailsSection";
import { ConversationSummary } from "@components/support/case-creation-layout/form-sections/conversation-summary-section/ConversationSummary";
import {
  getBaseDeploymentOptions,
  getBaseProductOptions,
  resolveDeploymentMatch,
  resolveIssueTypeKey,
  resolveProductId,
} from "@utils/caseCreation";
import { htmlToPlainText } from "@utils/richTextEditor";
import UploadAttachmentModal from "@components/support/case-details/attachments-tab/UploadAttachmentModal";

const DEFAULT_CASE_TITLE = "Support case";
const DEFAULT_CASE_DESCRIPTION = "Please describe your issue here.";

/**
 * CreateCasePage component to review and edit AI-generated case details.
 *
 * @returns {JSX.Element} The rendered CreateCasePage.
 */
export default function CreateCasePage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { showLoader, hideLoader } = useLoader();
  const { data: projectDetails, isLoading: isProjectLoading } =
    useGetProjectDetails(projectId || "");
  const { data: filters, isLoading: isFiltersLoading } = useGetCasesFilters(
    projectId || "",
  );
  const { isMockEnabled } = useMockConfig();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [product, setProduct] = useState("");
  const [deployment, setDeployment] = useState("");
  const [severity, setSeverity] = useState("");
  type AttachmentItem = { id: string; file: File };
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const attachmentNamesRef = useRef<Map<string, string>>(new Map());
  const attachmentIdCounterRef = useRef(0);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const { data: projectDeployments, isLoading: isDeploymentsLoading } =
    useGetProjectDeployments(projectId || "");
  const baseDeploymentOptions = getBaseDeploymentOptions(projectDeployments);
  const selectedDeploymentMatch = useMemo(
    () => resolveDeploymentMatch(deployment, projectDeployments, undefined),
    [deployment, projectDeployments],
  );
  const selectedDeploymentId = selectedDeploymentMatch?.id ?? "";
  const {
    data: deploymentProductsData,
    isLoading: deploymentProductsLoading,
    isError: deploymentProductsError,
  } = useGetDeploymentsProducts(selectedDeploymentId);
  const allDeploymentProducts = useMemo(
    () =>
      (deploymentProductsData ?? []).filter((item) =>
        item.product?.label?.trim(),
      ),
    [deploymentProductsData],
  );
  const baseProductOptions = getBaseProductOptions(allDeploymentProducts);
  const { showError } = useErrorBanner();
  const { showSuccess } = useSuccessBanner();
  const { mutate: postCase, isPending: isCreatePending } = usePostCase();
  const postAttachments = usePostAttachments();

  useEffect(() => {
    if (deploymentProductsError) {
      showError(
        "Could not load product options. Some options may be unavailable.",
      );
    }
  }, [deploymentProductsError, showError]);

  const hasInitializedRef = useRef(false);
  const projectDisplay = projectDetails?.name ?? "";

  const issueTypesList = (filters?.issueTypes || []) as {
    id: string;
    label: string;
  }[];
  const severityLevelsList = (filters?.severities || []) as {
    id: string;
    label: string;
  }[];

  useEffect(() => {
    if (isProjectLoading || isFiltersLoading) {
      showLoader();
    } else {
      hideLoader();
    }
    return () => hideLoader();
  }, [isProjectLoading, isFiltersLoading, showLoader, hideLoader]);

  const handleDeploymentChange = useCallback((value: string) => {
    setDeployment(value);
    setProduct("");
  }, []);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (isFiltersLoading || isDeploymentsLoading) return;

    const initialDeployment = baseDeploymentOptions[0] ?? "";
    const initialIssueType = issueTypesList[0]?.label ?? "";
    const initialSeverity = severityLevelsList[0]?.id ?? "";

    queueMicrotask(() => {
      setDeployment(initialDeployment);
      setProduct("");
      setIssueType(initialIssueType);
      setSeverity(initialSeverity);
      setTitle(DEFAULT_CASE_TITLE);
      setDescription(DEFAULT_CASE_DESCRIPTION);
    });
    hasInitializedRef.current = true;
  }, [
    baseDeploymentOptions,
    isDeploymentsLoading,
    issueTypesList,
    isFiltersLoading,
    severityLevelsList,
  ]);

  useEffect(() => {
    if (!selectedDeploymentId || !baseProductOptions.length) return;
    setProduct((current) =>
      baseProductOptions.includes(current) ? current : baseProductOptions[0],
    );
  }, [baseProductOptions, selectedDeploymentId]);

  const handleBack = () => {
    if (projectId) {
      navigate(`/${projectId}/support/chat`);
    } else {
      navigate(-1);
    }
  };

  const handleAttachmentClick = () => {
    setIsAttachmentModalOpen(true);
  };

  const fileSignature = (f: File) =>
    `${f.name}-${f.size}-${f.lastModified}`;

  const handleSelectAttachment = (file: File, attachmentName?: string) => {
    setAttachments((prev) => {
      const isDuplicate = prev.some(
        (a) => fileSignature(a.file) === fileSignature(file),
      );
      if (isDuplicate) return prev;
      const uniqueId = `att-${++attachmentIdCounterRef.current}-${Date.now()}`;
      if (attachmentName?.trim()) {
        attachmentNamesRef.current.set(uniqueId, attachmentName.trim());
      }
      return [...prev, { id: uniqueId, file }];
    });
  };

  const handleAttachmentRemove = (index: number) => {
    setAttachments((prev) => {
      const item = prev[index];
      if (item) {
        attachmentNamesRef.current.delete(item.id);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    if (isMockEnabled) {
      showSuccess("Case created successfully");
      navigate(`/${projectId}/support/cases/mock-case-created`);
      return;
    }

    const deploymentMatch = resolveDeploymentMatch(
      deployment,
      projectDeployments,
      undefined,
    );
    if (!deploymentMatch) {
      showError("Please select a valid deployment.");
      return;
    }

    const productId = resolveProductId(product, allDeploymentProducts);
    if (!productId) {
      showError("Please select a valid product.");
      return;
    }

    const issueTypeKey = resolveIssueTypeKey(issueType, filters?.issueTypes);
    const severityKey = parseInt(severity, 10) || 0;

    const payload: CreateCaseRequest = {
      deploymentId: String(deploymentMatch.id),
      description: htmlToPlainText(description),
      issueTypeKey,
      productId: String(productId),
      projectId,
      severityKey,
      title,
    };

    postCase(payload, {
      onSuccess: async (data) => {
        const caseId = data.id;

        if (attachments.length > 0) {
          setIsUploadingAttachments(true);
          try {
            const uploadPromises = attachments.map((item) => {
              const displayName =
                attachmentNamesRef.current.get(item.id) || item.file.name;
              return new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const base64 =
                      typeof reader.result === "string" ? reader.result : "";
                    const commaIndex = base64.indexOf(",");
                    const content =
                      commaIndex >= 0 ? base64.slice(commaIndex + 1) : base64;

                    await postAttachments.mutateAsync({
                      caseId,
                      body: {
                        referenceType: "case",
                        name: displayName,
                        type:
                          item.file.type || "application/octet-stream",
                        content,
                      },
                    });
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                };
                reader.onerror = () =>
                  reject(
                    new Error(`Failed to read file: ${item.file.name}`),
                  );
                reader.readAsDataURL(item.file);
              });
            });

            const results = await Promise.allSettled(uploadPromises);
            const fulfilled = results.filter((r) => r.status === "fulfilled").length;
            const rejected = results.filter((r) => r.status === "rejected").length;

            if (rejected === 0) {
              showSuccess(
                "Case created and attachments uploaded successfully",
              );
            } else if (fulfilled === 0) {
              showError(
                "Case created, but all attachment uploads failed. Please try again.",
              );
            } else {
              showError(
                `Case created, but ${rejected} of ${results.length} attachment(s) failed to upload.`,
              );
            }
            navigate(`/${projectId}/support/cases/${caseId}`);
          } finally {
            setIsUploadingAttachments(false);
          }
        } else {
          showSuccess("Case created successfully");
          navigate(`/${projectId}/support/cases/${caseId}`);
        }
      },
      onError: () => {
        showError("We couldn't create your case. Please try again.");
      },
    });
  };

  const sectionMetadata = {
    deploymentTypes: baseDeploymentOptions,
    products: baseProductOptions,
  };
  const isProductDropdownDisabled =
    !selectedDeploymentId || deploymentProductsLoading;

  const renderContent = () => (
    <Grid container spacing={3}>
      {/* left column - form content */}
      <Grid size={{ xs: 12, md: 8 }}>
        {/* case creation form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <BasicInformationSection
            project={projectDisplay}
            product={product}
            setProduct={setProduct}
            deployment={deployment}
            setDeployment={handleDeploymentChange}
            metadata={sectionMetadata}
            isDeploymentLoading={isProjectLoading || isDeploymentsLoading}
            isProductDropdownDisabled={isProductDropdownDisabled}
            isProductLoading={
              !!selectedDeploymentId && deploymentProductsLoading
            }
          />

          <CaseDetailsSection
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            issueType={issueType}
            setIssueType={setIssueType}
            severity={severity}
            setSeverity={setSeverity}
            metadata={undefined}
            filters={filters}
            isLoading={isFiltersLoading}
            attachments={attachments.map((a) => a.file)}
            onAttachmentClick={handleAttachmentClick}
            onAttachmentRemove={handleAttachmentRemove}
            storageKey={
              projectId ? `create-case-draft-${projectId}` : undefined
            }
          />

          {/* form actions container */}
          <Box sx={{ display: "flex", justifyContent: "right" }}>
            {/* submit button */}
            <Button
              type="submit"
              variant="contained"
              startIcon={<CircleCheck size={18} />}
              color="primary"
              disabled={
                isMockEnabled ||
                isProjectLoading ||
                isFiltersLoading ||
                isCreatePending ||
                isUploadingAttachments ||
                !projectId ||
                !selectedDeploymentId ||
                deploymentProductsLoading ||
                deploymentProductsError
              }
            >
              {isCreatePending || isUploadingAttachments
                ? isUploadingAttachments
                  ? "Uploading Attachments..."
                  : "Creating..."
                : "Create Support Case"}
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* right column - sidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ConversationSummary metadata={undefined} isLoading={false} />
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", pt: 0, position: "relative" }}>
      {/* header section */}
      <CaseCreationHeader onBack={handleBack} />

      {/* main content grid container */}
      {renderContent()}

      <UploadAttachmentModal
        open={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSelect={handleSelectAttachment}
      />
    </Box>
  );
}
