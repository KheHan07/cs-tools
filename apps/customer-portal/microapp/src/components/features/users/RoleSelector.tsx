import { Stack, Chip, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";

import { MOCK_ROLES } from "@src/mocks/data/users";

export type RoleName = (typeof MOCK_ROLES)[number]["name"];

export const ROLE_NAMES = MOCK_ROLES.map((role) => role.name);

interface RoleSelectorProps {
  value: RoleName;
  onChange: (value: RoleName) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <RadioGroup value={value} onChange={(event) => onChange(event.target.value as RoleName)}>
      <Stack gap={0.5}>
        {ROLE_NAMES.map((role) => (
          <RoleOption key={role} role={role} />
        ))}
      </Stack>
    </RadioGroup>
  );
}

export function RoleOption({ role }: { role: RoleName }) {
  const admin = role === "Admin";

  return (
    <FormControlLabel
      value={role}
      control={<Radio />}
      labelPlacement="start"
      sx={{
        m: 0,
        justifyContent: "space-between",
      }}
      label={
        <Stack direction="row" alignItems="center" gap={1}>
          <Chip size="small" label={role} color={admin ? "error" : "default"} />
          {admin && <AdminPanelSettings fontSize="small" color="primary" />}
        </Stack>
      }
    ></FormControlLabel>
  );
}
