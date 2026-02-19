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

import { Box, IconButton, Paper, Stack, Typography } from "@wso2/oxygen-ui";
import { ArrowLeft, RefreshCw } from "@wso2/oxygen-ui-icons-react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useMemo, type JSX } from "react";
import { useGetRecommendedUpdateLevels } from "@api/useGetRecommendedUpdateLevels";
import { useGetProductUpdateLevels } from "@api/useGetProductUpdateLevels";
import { getPendingUpdateLevels } from "@utils/updates";
import { PendingUpdatesList } from "@components/updates/pending-updates/PendingUpdatesList";
import PendingUpdatesListSkeleton from "@components/updates/pending-updates/PendingUpdatesListSkeleton";

/**
 * PendingUpdatesPage displays pending update levels for a product.
 * Matches productName and productBaseVersion from recommended vs product-update-levels APIs.
 *
 * @returns {JSX.Element} The rendered Pending Updates page.
 */
export default function PendingUpdatesPage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();

  const productName = searchParams.get("productName") ?? "";
  const productBaseVersion = searchParams.get("productBaseVersion") ?? "";

  const { data: recommendedData } = useGetRecommendedUpdateLevels();
  const { data: productLevelsData, isLoading: isProductLevelsLoading } =
    useGetProductUpdateLevels();

  const recommendedItem = useMemo(
    () =>
      recommendedData?.find(
        (r) =>
          r.productName === productName &&
          r.productBaseVersion === productBaseVersion,
      ),
    [recommendedData, productName, productBaseVersion],
  );

  const pendingRows = useMemo(
    () =>
      recommendedItem
        ? getPendingUpdateLevels(recommendedItem, productLevelsData)
        : [],
    [recommendedItem, productLevelsData],
  );

  const displayTitle = useMemo(() => {
    const name = productName || "Product";
    const ver = productBaseVersion || "";
    return ver ? `${name} ${ver}` : name;
  }, [productName, productBaseVersion]);

  const levelRange =
    pendingRows.length > 0
      ? `${pendingRows[0].updateLevel} to ${pendingRows[pendingRows.length - 1].updateLevel}`
      : null;

  const handleBack = () => {
    if (projectId) {
      navigate(`/${projectId}/updates`);
    } else {
      navigate(-1);
    }
  };

  if (!productName || !productBaseVersion) {
    return (
      <Box sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <IconButton onClick={handleBack} size="small" aria-label="Back">
            <ArrowLeft size={20} />
          </IconButton>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Missing product parameters. Use the Updates page to open pending updates.
        </Typography>
      </Box>
    );
  }

  const isLoading =
    isProductLevelsLoading || (recommendedData === undefined && !pendingRows.length);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          flexShrink: 0,
          zIndex: 10,
          borderRadius: 0,
        }}
      >
        <Stack direction="row" alignItems="center" gap={2}>
          <IconButton onClick={handleBack} size="small" aria-label="Back">
            <ArrowLeft size={20} />
          </IconButton>
          <Box
            sx={{
              p: 1,
              bgcolor: "warning.lighter",
              color: "warning.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw size={24} />
          </Box>
          <Box>
            <Typography variant="h5" color="text.primary" fontWeight={600}>
              {displayTitle} - Pending Updates
            </Typography>
            {levelRange && (
              <Typography variant="body2" color="text.secondary">
                Update levels {levelRange}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          p: 3,
          pt: 2,
        }}
      >
        {isLoading ? (
          <PendingUpdatesListSkeleton />
        ) : (
          <PendingUpdatesList
            pendingRows={pendingRows}
            recommendedItem={recommendedItem}
          />
        )}
      </Box>
    </Box>
  );
}
