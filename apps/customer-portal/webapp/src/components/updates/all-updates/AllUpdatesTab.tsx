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
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { FileText } from "@wso2/oxygen-ui-icons-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import type { SelectChangeEvent } from "@wso2/oxygen-ui";
import { useGetRecommendedUpdateLevels } from "@api/useGetRecommendedUpdateLevels";
import { usePostUpdateLevelsSearch } from "@api/usePostUpdateLevelsSearch";
import { PendingUpdatesList } from "@components/updates/pending-updates/PendingUpdatesList";
import PendingUpdatesListSkeleton from "@components/updates/pending-updates/PendingUpdatesListSkeleton";
import EmptyState from "@components/common/empty-state/EmptyState";
import ErrorStateIcon from "@components/common/error-state/ErrorStateIcon";
import UpdateLevelsReportModal from "@components/updates/all-updates/UpdateLevelsReportModal";
import type { RecommendedUpdateLevelItem } from "@models/responses";
import { getUpdateLevelsReportData } from "@utils/updateLevelsReportPdf";

export interface AllUpdatesTabFilterState {
  productName: string;
  productVersion: string;
  startLevel: string;
  endLevel: string;
}

const INITIAL_FILTER: AllUpdatesTabFilterState = {
  productName: "",
  productVersion: "",
  startLevel: "",
  endLevel: "",
};

function isValidFilter(
  f: AllUpdatesTabFilterState,
): { valid: true; start: number; end: number } | { valid: false } {
  const start = Number(f.startLevel);
  const end = Number(f.endLevel);
  if (
    !f.productName ||
    !f.productVersion ||
    f.startLevel === "" ||
    f.endLevel === "" ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end < 0 ||
    start > end
  ) {
    return { valid: false };
  }
  return { valid: true, start, end };
}

/**
 * Derives unique product names from recommended update level data.
 *
 * @param {RecommendedUpdateLevelItem[] | undefined} data - Raw recommended levels.
 * @returns {string[]} Sorted unique product names.
 */
function getProductNames(data: RecommendedUpdateLevelItem[] | undefined): string[] {
  if (!data?.length) return [];
  const names = [...new Set(data.map((d) => d.productName))];
  return names.sort();
}

/**
 * Derives product versions for a selected product.
 *
 * @param {RecommendedUpdateLevelItem[] | undefined} data - Raw recommended levels.
 * @param {string} productName - Selected product.
 * @returns {RecommendedUpdateLevelItem[]} Matching items.
 */
function getVersionsForProduct(
  data: RecommendedUpdateLevelItem[] | undefined,
  productName: string,
): RecommendedUpdateLevelItem[] {
  if (!data?.length || !productName) return [];
  return data.filter((d) => d.productName === productName);
}

/**
 * AllUpdatesTab displays a filter section and search results for update levels.
 * Uses GET /updates/recommended-update-levels for dropdown options and
 * POST /updates/levels/search for results.
 *
 * @returns {JSX.Element} The rendered All Updates tab content.
 */
export default function AllUpdatesTab(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [filter, setFilter] = useState<AllUpdatesTabFilterState>(INITIAL_FILTER);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    productName: string;
    productVersion: string;
    startingUpdateLevel: number;
    endingUpdateLevel: number;
  } | null>(null);

  const { data: recommendedData, isLoading: isRecommendedLoading, isError: isRecommendedError } = useGetRecommendedUpdateLevels();

  const { data: searchData, isLoading: isSearchLoading, isError: isSearchError } = usePostUpdateLevelsSearch(searchParams);

  const productNames = useMemo(() => getProductNames(recommendedData), [recommendedData]);

  const versionItems = useMemo(
    () => getVersionsForProduct(recommendedData, filter.productName),
    [recommendedData, filter.productName],
  );

  const selectedItem = useMemo(
    () =>
      versionItems.find(
        (v) => v.productName === filter.productName && v.productBaseVersion === filter.productVersion,
      ),
    [versionItems, filter.productName, filter.productVersion],
  );

  const startLevelOptions = useMemo(() => {
    if (!selectedItem) return [];
    const max = selectedItem.recommendedUpdateLevel;
    const min = Math.min(selectedItem.startingUpdateLevel, max);
    const opts: number[] = [];
    for (let i = min; i <= max; i++) opts.push(i);
    return opts;
  }, [selectedItem]);

  const endLevelOptions = useMemo(() => {
    if (!selectedItem || !filter.startLevel) return [];
    const start = Number(filter.startLevel);
    const max = selectedItem.recommendedUpdateLevel;
    const opts: number[] = [];
    for (let i = start; i <= max; i++) opts.push(i);
    return opts;
  }, [selectedItem, filter.startLevel]);

  const handleFilterChange = useCallback(
    (field: keyof AllUpdatesTabFilterState) => (e: SelectChangeEvent<string>) => {
      const value = e.target.value;
      setFilter((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "productName") {
          next.productVersion = "";
          next.startLevel = "";
          next.endLevel = "";
        } else if (field === "productVersion") {
          next.startLevel = "";
          next.endLevel = "";
        } else if (field === "startLevel") {
          next.endLevel = "";
        }
        return next;
      });
    },
    [],
  );

  const handleSearch = useCallback(() => {
    const result = isValidFilter(filter);
    if (!result.valid) return;
    setSearchParams({
      productName: filter.productName,
      productVersion: filter.productVersion,
      startingUpdateLevel: result.start,
      endingUpdateLevel: result.end,
    });
  }, [filter]);

  const handleView = useCallback(
    (levelKey: string) => {
      if (!searchParams || !projectId) return;
      const params = new URLSearchParams({
        productName: searchParams.productName,
        productBaseVersion: searchParams.productVersion,
        startingUpdateLevel: String(searchParams.startingUpdateLevel),
        endingUpdateLevel: String(searchParams.endingUpdateLevel),
      });
      navigate(`/${projectId}/updates/pending/level/${levelKey}?${params}`);
    },
    [navigate, projectId, searchParams],
  );

  const reportData = useMemo(() => {
    if (!searchData || !searchParams || Object.keys(searchData).length === 0) return null;
    try {
      return getUpdateLevelsReportData({
        productName: searchParams.productName,
        productVersion: searchParams.productVersion,
        startLevel: searchParams.startingUpdateLevel,
        endLevel: searchParams.endingUpdateLevel,
        data: searchData,
      });
    } catch {
      return null;
    }
  }, [searchData, searchParams]);

  const handleViewReport = useCallback(() => {
    if (!reportData) return;
    setReportModalOpen(true);
  }, [reportData]);

  const canSearch = isValidFilter(filter).valid;

  const canViewReport = !!reportData;

  if (isRecommendedError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          py: 5,
        }}
      >
        <ErrorStateIcon style={{ width: 200, height: "auto" }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Could not load filter options. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Card variant="outlined" sx={{ borderRadius: 0 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Search Update Levels
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={isRecommendedLoading}>
                <InputLabel id="all-updates-product-label">Product Name *</InputLabel>
                <Select
                  labelId="all-updates-product-label"
                  id="all-updates-product"
                  value={filter.productName}
                  label="Product Name *"
                  onChange={handleFilterChange("productName")}
                >
                  <MenuItem value="">
                    <Typography variant="body2">Select Product</Typography>
                  </MenuItem>
                  {productNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Typography variant="body2">{name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={isRecommendedLoading || !filter.productName}>
                <InputLabel id="all-updates-version-label">Product Version *</InputLabel>
                <Select
                  labelId="all-updates-version-label"
                  id="all-updates-version"
                  value={filter.productVersion}
                  label="Product Version *"
                  onChange={handleFilterChange("productVersion")}
                >
                  <MenuItem value="">
                    <Typography variant="body2">Select Version</Typography>
                  </MenuItem>
                  {versionItems.map((v) => (
                    <MenuItem key={`${v.productName}-${v.productBaseVersion}`} value={v.productBaseVersion}>
                      <Typography variant="body2">{v.productBaseVersion}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={!filter.productVersion}>
                <InputLabel id="all-updates-start-label">Starting Update Level *</InputLabel>
                <Select
                  labelId="all-updates-start-label"
                  id="all-updates-start"
                  value={filter.startLevel}
                  label="Starting Update Level *"
                  onChange={handleFilterChange("startLevel")}
                >
                  <MenuItem value="">
                    <Typography variant="body2">Select Level</Typography>
                  </MenuItem>
                  {startLevelOptions.map((level) => (
                    <MenuItem key={level} value={String(level)}>
                      <Typography variant="body2">{level}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={!filter.startLevel}>
                <InputLabel id="all-updates-end-label">Ending Update Level *</InputLabel>
                <Select
                  labelId="all-updates-end-label"
                  id="all-updates-end"
                  value={filter.endLevel}
                  label="Ending Update Level *"
                  onChange={handleFilterChange("endLevel")}
                >
                  <MenuItem value="">
                    <Typography variant="body2">Select Level</Typography>
                  </MenuItem>
                  {endLevelOptions.map((level) => (
                    <MenuItem key={level} value={String(level)}>
                      <Typography variant="body2">{level}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={handleSearch}
              disabled={!canSearch || isSearchLoading}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<FileText size={18} />}
              onClick={handleViewReport}
              disabled={!canViewReport}
            >
              View Report
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {!searchParams ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Select product, version, and update level range, then click Search to view updates.
          </Typography>
        </Paper>
      ) : isSearchLoading ? (
        <PendingUpdatesListSkeleton />
      ) : isSearchError ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            py: 5,
          }}
        >
          <ErrorStateIcon style={{ width: 200, height: "auto" }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Failed to load update levels. Please try again.
          </Typography>
        </Box>
      ) : searchData && Object.keys(searchData).length === 0 ? (
        <EmptyState description="No update levels found for the selected criteria." />
      ) : (
        <PendingUpdatesList
          data={searchData ?? null}
          isError={false}
          onView={handleView}
        />
      )}

      <UpdateLevelsReportModal
        open={reportModalOpen}
        reportData={reportData}
        onClose={() => setReportModalOpen(false)}
      />
    </Stack>
  );
}
