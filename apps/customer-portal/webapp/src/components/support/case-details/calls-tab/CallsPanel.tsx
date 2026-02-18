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

import { Button, Stack } from "@wso2/oxygen-ui";
import { PhoneCall } from "@wso2/oxygen-ui-icons-react";
import { type JSX } from "react";
import { useGetCallRequests } from "@api/useGetCallRequests";
import CallsListSkeleton from "@case-details-calls/CallsListSkeleton";
import CallRequestList from "@case-details-calls/CallRequestList";
import CallsEmptyState from "@case-details-calls/CallsEmptyState";
import CallsErrorState from "@case-details-calls/CallsErrorState";

export interface CallsPanelProps {
  projectId: string;
  caseId: string;
}

/**
 * CallsPanel displays call requests for a specific case.
 *
 * @param {CallsPanelProps} props - The project and case identifiers.
 * @returns {JSX.Element} The rendered calls panel.
 */
export default function CallsPanel({
  projectId,
  caseId,
}: CallsPanelProps): JSX.Element {
  const { data, isPending, isError } = useGetCallRequests(projectId, caseId);

  const callRequests = data?.callRequests ?? [];

  return (
    <Stack spacing={3}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PhoneCall size={16} />}
        sx={{ alignSelf: "flex-start" }}
        disabled
      >
        Request Call
      </Button>

      {isPending ? (
        <CallsListSkeleton />
      ) : isError ? (
        <CallsErrorState />
      ) : callRequests.length === 0 ? (
        <CallsEmptyState />
      ) : (
        <CallRequestList requests={callRequests} />
      )}
    </Stack>
  );
}
