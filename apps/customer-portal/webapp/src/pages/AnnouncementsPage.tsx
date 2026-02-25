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

import { useParams, useNavigate } from "react-router";
import {
  useState,
  useMemo,
  type JSX,
  type ChangeEvent,
} from "react";
import {
  Box,
  Button,
  Stack,
  Tabs,
  Tab,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@wso2/oxygen-ui";
import { ArrowLeft } from "@wso2/oxygen-ui-icons-react";
import useGetCasesFilters from "@api/useGetCasesFilters";
import { useGetProjectCasesPage } from "@api/useGetProjectCasesPage";
import { getAnnouncementCaseTypeId } from "@utils/support";
import type { AnnouncementFilterValues } from "@constants/supportConstants";
import { CaseStatus } from "@constants/supportConstants";
import AnnouncementStatCards from "@components/support/announcements/AnnouncementStatCards";
import AnnouncementsSearchBar from "@components/support/announcements/AnnouncementsSearchBar";
import AnnouncementList from "@components/support/announcements/AnnouncementList";
import AllCasesListSkeleton from "@components/support/all-cases/AllCasesListSkeleton";

type AnnouncementTab = "all" | "unread" | "archived";

/**
 * AnnouncementsPage component to display announcements with stats, tabs, filters, and search.
 *
 * @returns {JSX.Element} The rendered Announcements page.
 */
export default function AnnouncementsPage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilterValues>({});
  const [activeTab, setActiveTab] = useState<AnnouncementTab>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: filterMetadata } = useGetCasesFilters(projectId || "");
  const announcementId = getAnnouncementCaseTypeId(filterMetadata?.caseTypes);

  const closedState = useMemo(
    () =>
      filterMetadata?.caseStates?.find(
        (s) => s.label.toLowerCase() === CaseStatus.CLOSED.toLowerCase(),
      ),
    [filterMetadata?.caseStates],
  );

  const closedStatusId = useMemo(
    () => (closedState?.id ? [Number(closedState.id)] : undefined),
    [closedState?.id],
  );

  const nonClosedStatusIds = useMemo(() => {
    const rest = (filterMetadata?.caseStates ?? []).filter(
      (s) => s.id !== closedState?.id,
    );
    return rest.length > 0 ? rest.map((s) => Number(s.id)) : undefined;
  }, [filterMetadata?.caseStates, closedState?.id]);

  // TODO: "unread" tab currently filters by non-closed status (active); real read/unread state not yet implemented.
  const statusIdsForTab = useMemo(() => {
    if (activeTab === "archived") return closedStatusId;
    if (activeTab === "unread") return nonClosedStatusIds;
    return undefined;
  }, [activeTab, closedStatusId, nonClosedStatusIds]);

  const caseSearchRequest = useMemo(
    () => ({
      filters: {
        caseTypeIds:
          announcementId && announcementId.trim()
            ? [announcementId]
            : undefined,
        statusIds: filters.statusId
          ? [Number(filters.statusId)]
          : statusIdsForTab,
        severityId: filters.severityId ? Number(filters.severityId) : undefined,
        searchQuery: searchTerm.trim() || undefined,
      },
      sortBy: {
        field: "createdOn",
        order: sortOrder,
      },
    }),
    [announcementId, filters, searchTerm, sortOrder, statusIdsForTab],
  );

  const offset = (page - 1) * pageSize;

  const {
    data,
    isLoading: isCasesQueryLoading,
  } = useGetProjectCasesPage(
    projectId || "",
    caseSearchRequest,
    offset,
    pageSize,
    { enabled: !!announcementId },
  );

  const cases = data?.cases ?? [];
  const totalRecords = data?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const isCasesAreaLoading =
    isCasesQueryLoading || (!!projectId && !!announcementId && !data);

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleSortChange = (value: "desc" | "asc") => {
    setSortOrder(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, value: string) => {
    setActiveTab(value as AnnouncementTab);
    setPage(1);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("..")}
          sx={{ mb: 2 }}
          variant="text"
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ mb: 1 }}>
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage announcements for your project
          </Typography>
        </Box>
      </Box>

      <AnnouncementStatCards />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab label="All Announcements" value="all" />
        <Tab label="Unread" value="unread" />
        <Tab label="Archived" value="archived" />
      </Tabs>

      <AnnouncementsSearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        isFiltersOpen={isFiltersOpen}
        onFiltersToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        filters={filters}
        filterMetadata={filterMetadata}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {cases.length} of {totalRecords} announcements
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="sort-label">Sort</InputLabel>
            <Select<"desc" | "asc">
              labelId="sort-label"
              id="sort"
              value={sortOrder}
              label="Sort"
              onChange={(e) =>
                handleSortChange(e.target.value as "desc" | "asc")
              }
            >
              <MenuItem value="desc">
                <Typography variant="body2">Newest First</Typography>
              </MenuItem>
              <MenuItem value="asc">
                <Typography variant="body2">Oldest First</Typography>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {!announcementId && filterMetadata ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            Announcement type not found in project filters.
          </Typography>
        </Box>
      ) : isCasesAreaLoading ? (
        <AllCasesListSkeleton />
      ) : (
        <AnnouncementList
          cases={cases}
          isLoading={false}
          onCaseClick={(c) =>
            navigate(`/${projectId}/announcements/${c.id}`)
          }
        />
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
          />
        </Box>
      )}
    </Stack>
  );
}
