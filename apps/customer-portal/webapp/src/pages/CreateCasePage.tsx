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
import { useLocation, useNavigate, useParams } from "react-router";
import useGetCasesFilters from "@api/useGetCasesFilters";
import useGetProjectDetails from "@api/useGetProjectDetails";
import { useGetProjectDeployments } from "@api/useGetProjectDeployments";
import { useGetDeploymentsProducts } from "@api/useGetDeploymentsProducts";
import { usePostCase } from "@api/usePostCase";
import { usePostAttachments } from "@api/usePostAttachments";
import { useLoader } from "@context/linear-loader/LoaderContext";
import { useErrorBanner } from "@context/error-banner/ErrorBannerContext";
import { useSuccessBanner } from "@context/success-banner/SuccessBannerContext";
import type { CreateCaseRequest } from "@models/requests";
import { BasicInformationSection } from "@components/support/case-creation-layout/form-sections/basic-information-section/BasicInformationSection";
import { CaseCreationHeader } from "@components/support/case-creation-layout/header/CaseCreationHeader";
import { CaseDetailsSection } from "@components/support/case-creation-layout/form-sections/case-details-section/CaseDetailsSection";
import { ConversationSummary } from "@components/support/case-creation-layout/form-sections/conversation-summary-section/ConversationSummary";
import { RelatedCaseSummary } from "@components/support/case-creation-layout/form-sections/conversation-summary-section/RelatedCaseSummary";
import {
  buildClassificationProductLabel,
  getBaseDeploymentOptions,
  getBaseProductOptions,
  resolveDeploymentMatch,
  resolveIssueTypeKey,
  resolveProductId,
  shouldAddClassificationProductToOptions,
} from "@utils/caseCreation";
import { CaseSeverity, CaseSeverityLevel } from "@constants/supportConstants";
import { escapeHtml, htmlToPlainText } from "@utils/richTextEditor";
import UploadAttachmentModal from "@components/support/case-details/attachments-tab/UploadAttachmentModal";

const DEFAULT_CASE_TITLE = "Support case";
const DEFAULT_CASE_DESCRIPTION = "Please describe your issue here.";

interface ChatMessageForClassification {
  text: string;
  sender: string;
}

/**
 * CreateCasePage component to review and edit AI-generated case details.
 *
 * @returns {JSX.Element} The rendered CreateCasePage.
 */
export interface RelatedCaseState {
  number: string;
  title: string;
  description: string;
}

export default function CreateCasePage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const relatedCase = (location.state as { relatedCase?: RelatedCaseState })?.relatedCase;
  const { showLoader, hideLoader } = useLoader();
  const { data: projectDetails, isLoading: isProjectLoading } =
    useGetProjectDetails(projectId || "");
  const { data: filters, isLoading: isFiltersLoading } = useGetCasesFilters(
    projectId || "",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [product, setProduct] = useState("");
  const [deployment, setDeployment] = useState("");
  const [severity, setSeverity] = useState("");
  const [classificationProductLabel, setClassificationProductLabel] =
    useState("");
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
  const hasClassificationAppliedRef = useRef(false);

  const locationState = location.state as {
    messages?: ChatMessageForClassification[];
    classificationResponse?: {
      issueType?: string;
      severityLevel?: string;
      caseInfo?: {
        description?: string;
        shortDescription?: string;
        productName?: string;
        productVersion?: string;
        environment?: string;
      };
    };
  } | null;

  const STORAGE_KEY = `case_classification_data_${projectId}`;

  const [classificationResponse, setClassificationResponse] = useState<
    | {
        issueType?: string;
        severityLevel?: string;
        caseInfo?: {
          description?: string;
          shortDescription?: string;
          productName?: string;
          productVersion?: string;
          environment?: string;
        };
      }
    | undefined
  >(() => {
    if (locationState?.classificationResponse) {
      return locationState.classificationResponse;
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : undefined;
    } catch (e) {
      console.error("Failed to parse stored classification data", e);
      return undefined;
    }
  });

  useEffect(() => {
    if (locationState?.classificationResponse) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(locationState.classificationResponse),
        );
      } catch (e) {
        console.error(
          "Failed to store classification data in sessionStorage",
          e,
        );
      }
      setClassificationResponse(locationState.classificationResponse);
    }
  }, [locationState?.classificationResponse, STORAGE_KEY]);
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
    const initialIssueType = relatedCase
      ? ""
      : (issueTypesList[0]?.label ?? "");
    const initialSeverity = relatedCase ? "" : (severityLevelsList[0]?.id ?? "");

    queueMicrotask(() => {
      if (relatedCase) {
        setDeployment("");
        setProduct("");
        setIssueType("");
        setSeverity("");
        setTitle("");
        setDescription("");
      } else if (!classificationResponse) {
        setDeployment(initialDeployment);
        setProduct("");
        setIssueType(initialIssueType);
        setSeverity(initialSeverity);
        setTitle(DEFAULT_CASE_TITLE);
        setDescription(DEFAULT_CASE_DESCRIPTION);
      }
    });
    hasInitializedRef.current = true;
  }, [
    baseDeploymentOptions,
    classificationResponse,
    isDeploymentsLoading,
    issueTypesList,
    isFiltersLoading,
    relatedCase,
    severityLevelsList,
  ]);

  useEffect(() => {
    if (relatedCase) return;
    if (!classificationResponse?.caseInfo) return;
    const info = classificationResponse.caseInfo;
    if (info.shortDescription?.trim()) setTitle(info.shortDescription);
    if (info.description?.trim()) {
      const text = info.description.trim();
      const isLikelyHtml = /<[a-zA-Z][^>]*>[\s\S]*<\/[a-zA-Z][^>]*>|<[a-zA-Z][^>]*\/>/.test(
        text,
      );
      const html = isLikelyHtml ? text : `<p>${escapeHtml(text)}</p>`;
      setDescription(html);
    }
  }, [classificationResponse, relatedCase]);

  useEffect(() => {
    if (relatedCase) return;
    if (hasClassificationAppliedRef.current || !classificationResponse) return;
    if (isFiltersLoading || isDeploymentsLoading) return;

    if (!baseDeploymentOptions.length || !severityLevelsList.length) return;

    const info = classificationResponse.caseInfo;
    const deploymentLabel = info?.environment?.trim();
    const productLabel = buildClassificationProductLabel(info);
    const issueTypeLabel = classificationResponse.issueType?.trim();
    const severityLabel = classificationResponse.severityLevel?.trim();

    hasClassificationAppliedRef.current = true;

    setDeployment((prev) =>
      deploymentLabel && baseDeploymentOptions.includes(deploymentLabel)
        ? deploymentLabel
        : prev,
    );
    setProduct((prev) => (productLabel ? productLabel : prev));
    setIssueType((prev) =>
      issueTypeLabel &&
      issueTypesList.some(
        (t) => t.label === issueTypeLabel || t.id === issueTypeLabel,
      )
        ? issueTypeLabel
        : prev,
    );

    const severityMapping: Record<string, string> = {
      [CaseSeverityLevel.S0]: CaseSeverity.CATASTROPHIC,
      [CaseSeverityLevel.S1]: CaseSeverity.CRITICAL,
      [CaseSeverityLevel.S2]: CaseSeverity.HIGH,
      [CaseSeverityLevel.S3]: CaseSeverity.MEDIUM,
      [CaseSeverityLevel.S4]: CaseSeverity.LOW,
    };

    const mappedLabel = severityMapping[severityLabel ?? ""] ?? severityLabel;

    const matchedSeverity = severityLevelsList.find(
      (s) =>
        s.id === severityLabel ||
        s.label === severityLabel ||
        s.label === mappedLabel,
    );
    setSeverity((prev) => (matchedSeverity ? matchedSeverity.id : prev));
    if (productLabel) setClassificationProductLabel(productLabel);
  }, [
    classificationResponse,
    isFiltersLoading,
    relatedCase,
    isDeploymentsLoading,
    baseDeploymentOptions,
    issueTypesList,
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

  const fileSignature = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

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
                        type: item.file.type || "application/octet-stream",
                        content,
                      },
                    });
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                };
                reader.onerror = () =>
                  reject(new Error(`Failed to read file: ${item.file.name}`));
                reader.readAsDataURL(item.file);
              });
            });

            const results = await Promise.allSettled(uploadPromises);
            const fulfilled = results.filter(
              (r) => r.status === "fulfilled",
            ).length;
            const rejected = results.filter(
              (r) => r.status === "rejected",
            ).length;

            if (rejected === 0) {
              showSuccess("Case created and attachments uploaded successfully");
            } else if (fulfilled === 0) {
              showError(
                "Case created, but all attachment uploads failed. Please try again.",
              );
            } else {
              showError(
                `Case created, but ${rejected} of ${results.length} attachment(s) failed to upload.`,
              );
            }
          } finally {
            setIsUploadingAttachments(false);
          }
          sessionStorage.removeItem(STORAGE_KEY);
          navigate(`/${projectId}/support/cases/${caseId}`);
        } else {
          showSuccess("Case created successfully");
          sessionStorage.removeItem(STORAGE_KEY);
          navigate(`/${projectId}/support/cases/${caseId}`);
        }
      },
      onError: () => {
        showError("We couldn't create your case. Please try again.");
      },
    });
  };

  const extraProductOptions = useMemo(() => {
    if (!classificationProductLabel) return [];
    if (
      !shouldAddClassificationProductToOptions(
        classificationProductLabel,
        baseProductOptions,
      )
    ) {
      return [];
    }
    return [classificationProductLabel];
  }, [classificationProductLabel, baseProductOptions]);

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
            isRelatedCaseMode={!!relatedCase}
            extraProductOptions={extraProductOptions}
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
            isRelatedCaseMode={!!relatedCase}
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
                : relatedCase
                  ? "Create Related Case"
                  : "Create Support Case"}
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* right column - sidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        {relatedCase ? (
          <RelatedCaseSummary
            number={relatedCase.number}
            title={relatedCase.title}
            description={relatedCase.description}
          />
        ) : (
          <ConversationSummary metadata={undefined} isLoading={false} />
        )}
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", pt: 0, position: "relative" }}>
      {/* header section */}
      <CaseCreationHeader
        onBack={handleBack}
        hideAiChip={!!relatedCase}
      />

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
