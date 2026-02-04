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

import { Box, Button, Typography } from "@wso2/oxygen-ui";
import { Code, Cloud } from "@wso2/oxygen-ui-icons-react";
import { useMockConfig } from "@/providers/MockConfigProvider";
import { useAsgardeo } from "@asgardeo/react";
import type { JSX } from "react";

export default function LoginBox(): JSX.Element {
  const { signIn } = useAsgardeo();
  const { setMockEnabled } = useMockConfig();

  const handleLogin = async (isMock: boolean) => {
    setMockEnabled(isMock);
    await signIn();
  };

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Login to Account
        </Typography>

        <Typography color="text.secondary">
          Ready to explore? Pick an API source to continue.
        </Typography>
      </Box>

      <Box>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Code />}
          color="secondary"
          sx={{ my: 1 }}
          onClick={() => handleLogin(true)}
        >
          Continue with Mock APIs
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Cloud />}
          color="primary"
          sx={{ my: 1 }}
          onClick={() => handleLogin(false)}
        >
          Continue with Real APIs
        </Button>
      </Box>
    </Box>
  );
}
