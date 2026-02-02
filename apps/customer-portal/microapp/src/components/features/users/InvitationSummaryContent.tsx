import { Chip, Stack, Typography } from "@wso2/oxygen-ui";
import type { RoleName } from "./RoleSelector";

interface InvitationSummaryProps {
  projectName?: string;
  email: string;
  name: string;
  role: RoleName;
}

export function InvitationSummaryContent({ projectName, email, name, role }: InvitationSummaryProps) {
  const summary = [
    { label: "Project", value: projectName || "-" },
    { label: "User Email", value: email || "-" },
    { label: "User Name", value: name || "-" },
    { label: "Role", value: <Chip size="small" label={role} color={role === "Admin" ? "primary" : "default"} /> },
    { label: "Delivery Method", value: "Email" },
  ];

  return (
    <Stack gap={0.5}>
      {summary.map((item) => (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" color="text.secondary">
            {item.label}
          </Typography>
          <Typography component="span" variant="subtitle1">
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
