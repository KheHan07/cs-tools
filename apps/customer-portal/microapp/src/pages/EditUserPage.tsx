import { useState, type ReactNode } from "react";
import { Avatar, ButtonBase as Button, Card, InputAdornment, RadioGroup, Stack, Typography } from "@mui/material";
import { TextField } from "@components/features/create";
import { AccessTime, Email, Person } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { InvitationSummaryContent, RoleOption } from "@components/features/users";
import { useProject } from "@context/project";

import { MOCK_PROJECTS } from "@src/mocks/data/projects";
import { MOCK_ROLES } from "@src/mocks/data/users";

const ROLE_NAMES = MOCK_ROLES.map((role) => role.name);

export type RoleName = (typeof MOCK_ROLES)[number]["name"];

export default function EditUserPage({ mode = "invite" }: { mode?: "invite" | "edit" }) {
  const location = useLocation();
  const state = location.state as { email?: string; role?: string; name?: string };

  const [role, setRole] = useState<RoleName>(state?.role ?? "Admin");
  const [email, setEmail] = useState(state?.email ?? "");
  const [name, setName] = useState(state?.name ?? "");

  const { projectId } = useProject();
  const project = MOCK_PROJECTS.find((project) => project.id === projectId);

  return (
    <Stack gap={2}>
      {mode === "edit" && (
        <Card component={Stack} textAlign="center" alignItems="center" gap={2} p={3} elevation={0}>
          <Avatar
            sx={(theme) => ({
              width: 65,
              height: 65,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: theme.typography.h3,
              fontWeight: "medium",
            })}
          >
            LD
          </Avatar>
          <Stack textAlign="center" gap={0.5}>
            <Typography variant="h5" fontWeight="medium">
              Sarah Chen
            </Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
              <Email sx={(theme) => ({ fontSize: theme.typography.pxToRem(18), color: "text.secondary" })} />
              <Typography variant="subtitle2" fontWeight="regular" color="text.secondary">
                {email}
              </Typography>
            </Stack>
            <Typography variant="subtitle2" fontWeight="regular" color="text.secondary">
              Last Active: 2 hours ago
            </Typography>
          </Stack>
        </Card>
      )}
      <SectionCard title="User Details">
        <Stack gap={2}>
          <TextField
            label="Email Address"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            }
          />
          <TextField
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            }
          />
        </Stack>
      </SectionCard>

      {/* <SectionCard title="User Role">
        <RoleSelector value={role} onChange={setRole} />
      </SectionCard> */}

      <SectionCard title="User Status">
        <RadioGroup value={role} onChange={(event) => setRole(event.target.value as RoleName)}>
          {ROLE_NAMES.map((role, index) => (
            <RoleOption key={index} role={role} />
          ))}
        </RadioGroup>
      </SectionCard>

      <SectionCard title="Invitation Summary">
        <InvitationSummaryContent projectName={project?.name} email={email} name={name} role={role} />
      </SectionCard>

      <ExpirationNotice />

      <SendButton />
      <CancelButton />
    </Stack>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card component={Stack} gap={2} p={2} elevation={0}>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        {title}
      </Typography>
      {children}
    </Card>
  );
}

function SendButton() {
  return (
    <Button component={Link} sx={{ fontWeight: "medium" }} to="/users">
      Send Invitation
    </Button>
  );
}

function CancelButton() {
  return (
    <Button component={Link} sx={{ fontWeight: "medium", bgcolor: "background.paper" }} to="/users">
      Cancel
    </Button>
  );
}

function ExpirationNotice() {
  return (
    <Card
      component={Stack}
      direction="row"
      alignItems="top"
      px={2}
      py={1.5}
      gap={2}
      elevation={0}
      sx={{ bgcolor: "components.popover.state.active.background" }}
    >
      <AccessTime color="primary" sx={(theme) => ({ fontSize: theme.typography.pxToRem(20) })} />
      <Typography variant="subtitle2" fontWeight="medium" color="text.secondary">
        Important: &nbsp;
        <Typography component="span" variant="subtitle2" fontWeight="regular">
          Invitation links expire after 7 days. If the user doesn't accept the invitation within this timeframe, you'll
          need to send a new invitation.
        </Typography>
      </Typography>
    </Card>
  );
}
