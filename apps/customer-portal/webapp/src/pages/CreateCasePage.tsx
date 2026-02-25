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
  findMatchingDeploymentLabel,
  findMatchingProductId,
  getBaseDeploymentOptions,
  getBaseProductOptions,
  getDeploymentDisplayLabelForEnvironment,
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
  parentCaseId?: string;
  number: string;
  title: string;
  description: string;
  /** Parent case deployment (development type); shown disabled in form. */
  deploymentId?: string;
  deploymentLabel?: string;
}

export default function CreateCasePage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const locationStateRaw = location.state as {
    relatedCase?: RelatedCaseState;
    skipChat?: boolean;
  } | null;
  const relatedCase = locationStateRaw?.relatedCase;
  const skipChat = !!locationStateRaw?.skipChat;
  const { showLoader, hideLoader } = useLoader();
  const { data: projectDetails, isLoading: isProjectLoading } =
    useGetProjectDetails(projectId || "");
  const { data: filters, isLoading: isFiltersLoading } = useGetCasesFilters(
    projectId || "",
  );
  const [title, setTitle] = useState(() => relatedCase?.title ?? "");
  const [description, setDescription] = useState(() => {
    if (!relatedCase) return "";
    const prefix =
      "<p>-- This is the previous description (Edit or Delete if you want to alter) --</p>";
    return prefix + (relatedCase.description ?? "");
  });
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

  const skipChatMode = skipChat;
  const noAiMode = !!relatedCase || skipChatMode;

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
    if (skipChat) return undefined;
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

  const handleProductChange = useCallback((value: string) => {
    setProduct(value);
  }, []);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (isFiltersLoading || isDeploymentsLoading) return;

    const initialDeployment = baseDeploymentOptions[0] ?? "";
    const initialIssueType = noAiMode
      ? ""
      : (issueTypesList[0]?.label ?? "");
    const initialSeverity = noAiMode ? "" : (severityLevelsList[0]?.id ?? "");

    queueMicrotask(() => {
      if (noAiMode) {
        if (!relatedCase) {
          setDeployment("");
          setTitle("");
          setDescription("");
        }
        setProduct("");
        setIssueType("");
        setSeverity("");
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
    noAiMode,
    relatedCase,
    severityLevelsList,
  ]);

  // When opening a related case, prefill title, description (with prefix), and deployment from parent.
  const hasRelatedCaseInitializedRef = useRef(false);
  useEffect(() => {
    if (!relatedCase) return;
    if (hasRelatedCaseInitializedRef.current) return;

    setTitle(relatedCase.title ?? "");
    const prefix =
      "<p>-- This is the previous description (Edit or Delete if you want to alter) --</p>";
    setDescription(prefix + (relatedCase.description ?? ""));

    hasRelatedCaseInitializedRef.current = true;
  }, [relatedCase]);

  const hasRelatedCaseDeploymentInitializedRef = useRef(false);
  useEffect(() => {
    if (!relatedCase?.deploymentId && !relatedCase?.deploymentLabel) return;
    if (!projectDeployments?.length) return;
    if (hasRelatedCaseDeploymentInitializedRef.current) return;

    const dep = relatedCase.deploymentId
      ? projectDeployments.find((d) => d.id === relatedCase.deploymentId)
      : null;
    const displayLabel = dep
      ? (dep.name ?? dep.type?.label ?? relatedCase.deploymentLabel)
      : relatedCase.deploymentLabel;
    if (displayLabel) {
      setDeployment(displayLabel);
      hasRelatedCaseDeploymentInitializedRef.current = true;
    }
  }, [relatedCase, projectDeployments]);

  useEffect(() => {
    if (noAiMode) return;
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
  }, [classificationResponse, noAiMode]);

  useEffect(() => {
    if (noAiMode) return;
    if (hasClassificationAppliedRef.current || !classificationResponse) return;
    if (isFiltersLoading || isDeploymentsLoading) return;

    if (!baseDeploymentOptions.length || !severityLevelsList.length) return;

    const info = classificationResponse.caseInfo;
    const deploymentLabel = info?.environment?.trim();
    const productLabel = buildClassificationProductLabel(info);
    const issueTypeLabel = classificationResponse.issueType?.trim();
    const severityLabel = classificationResponse.severityLevel?.trim();

    hasClassificationAppliedRef.current = true;

    setDeployment((prev) => {
      if (!deploymentLabel) return prev;
      const matched =
        getDeploymentDisplayLabelForEnvironment(
          deploymentLabel,
          projectDeployments,
        ) ??
        findMatchingDeploymentLabel(deploymentLabel, baseDeploymentOptions);
      return matched ?? prev;
    });
    if (productLabel) setClassificationProductLabel(productLabel);
    // Product is auto-selected in the sync effect when products for the matched deployment load
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
  }, [
    classificationResponse,
    isFiltersLoading,
    noAiMode,
    isDeploymentsLoading,
    baseDeploymentOptions,
    issueTypesList,
    projectDeployments,
    severityLevelsList,
  ]);

  useEffect(() => {
    if (!selectedDeploymentId || !baseProductOptions.length) return;
    setProduct((current) => {
      if (!current?.trim()) {
        const fromClassification = findMatchingProductId(
          classificationProductLabel,
          baseProductOptions,
        );
        if (classificationProductLabel?.trim()) {
          return fromClassification ?? "";
        }
        return baseProductOptions[0]?.id ?? "";
      }
      const found = baseProductOptions.some((o) => o.id === current);
      if (found) return current;
      const fromLabel = findMatchingProductId(current, baseProductOptions);
      return fromLabel ?? baseProductOptions[0]?.id ?? "";
    });
  }, [
    baseProductOptions,
    classificationProductLabel,
    selectedDeploymentId,
  ]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (projectId) {
      navigate(`/${projectId}/support/cases`);
    } else {
      navigate("/");
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

    const titlePlain = htmlToPlainText(title).trim();
    const descriptionPlain = htmlToPlainText(description).trim();
    if (!titlePlain) {
      showError("Please enter a case title.");
      return;
    }
    if (!descriptionPlain) {
      showError("Please enter a description.");
      return;
    }

    const deploymentMatch = resolveDeploymentMatch(
      deployment,
      projectDeployments,
      undefined,
    );
    if (!deploymentMatch) {
      showError("Please select a deployment type.");
      return;
    }

    const productId = resolveProductId(product, allDeploymentProducts);
    if (!productId) {
      showError("Please select a product version.");
      return;
    }

    const issueTypeKey = resolveIssueTypeKey(issueType, filters?.issueTypes);
    if (!issueTypeKey) {
      showError("Please select an issue type.");
      return;
    }
    const parsedSeverity = parseInt(severity, 10);
    if (Number.isNaN(parsedSeverity)) {
      showError("Please select a severity.");
      return;
    }
    const severityKey = parsedSeverity;

    const payload: CreateCaseRequest = {
      deploymentId: String(deploymentMatch.id),
      description: descriptionPlain,
      issueTypeKey,
      productId: String(productId),
      projectId,
      severityKey,
      title,
      ...(relatedCase?.parentCaseId && {
        parentCaseId: relatedCase.parentCaseId,
      }),
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
      onError: (error) => {
        const msg =
          error?.message?.trim() ||
          "We couldn't create your case. Please check required fields and try again.";
        showError(msg);
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

  const isProductAutoDetected =
    !noAiMode &&
    !!classificationProductLabel?.trim() &&
    !!product?.trim();

  const isDeploymentAutoDetected =
    !noAiMode &&
    !!classificationResponse?.caseInfo?.environment?.trim() &&
    !!deployment?.trim();

  const sectionMetadata = {
    deploymentTypes: baseDeploymentOptions,
  };
  const isProductDropdownDisabled =
    !selectedDeploymentId || deploymentProductsLoading;

  const renderContent = () => (
    <Grid container spacing={3}>
      {/* left column - form content (full width when skipChat) */}
      <Grid size={{ xs: 12, md: skipChatMode ? 12 : 8 }}>
        {/* case creation form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <BasicInformationSection
            project={projectDisplay}
            product={product}
            setProduct={handleProductChange}
            deployment={deployment}
            setDeployment={handleDeploymentChange}
            productOptionList={baseProductOptions}
            isProductAutoDetected={isProductAutoDetected}
            isDeploymentAutoDetected={isDeploymentAutoDetected}
            metadata={sectionMetadata}
            isDeploymentLoading={isProjectLoading || isDeploymentsLoading}
            isProductDropdownDisabled={isProductDropdownDisabled}
            isProductLoading={
              !!selectedDeploymentId && deploymentProductsLoading
            }
            isRelatedCaseMode={noAiMode}
            extraProductOptions={extraProductOptions}
            isDeploymentDisabled={!!relatedCase}
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
            isRelatedCaseMode={noAiMode}
            isTitleDisabled={!!relatedCase}
            relatedCaseNumber={relatedCase?.number ?? ""}
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

      {/* right column - sidebar (hidden when skipChat) */}
      {!skipChatMode && (
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
      )}
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", pt: 0, position: "relative" }}>
      {/* header section */}
      <CaseCreationHeader
        onBack={handleBack}
        hideAiChip={noAiMode}
        backLabel="Back"
        title={relatedCase ? "Create Related Case" : undefined}
        subtitle={
          skipChatMode || relatedCase
            ? "Fill in the case details below and submit"
            : "Please review and edit the auto-populated information before submitting"
        }
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
