import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar as MuiAppBar, Button, Chip, IconButton, Stack, Typography, pxToRem, useTheme } from "@wso2/oxygen-ui";

import { NotificationBadge } from "@components/ui";
import { ProjectSelector } from "@components/features/projects";
import { useLayout } from "@src/context/layout";
import { useProject } from "@context/project";

import { APP_BAR_CONFIG } from "@components/layout/config";
import { MOCK_PROJECTS } from "@src/mocks/data/projects";
import { PROJECT_STATUS_META, PROJECT_TYPE_META } from "@config/constants";
import { ArrowLeft, Bell, ChevronDown, Folder } from "@wso2/oxygen-ui-icons-react";

export function AppBar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { title, appBarVariant, overlineSlot, subtitleSlot, startSlot, endSlot, appBarSlots, hasBackAction } =
    useLayout();
  const config = APP_BAR_CONFIG[appBarVariant];
  const { projectId } = useProject();
  const project = MOCK_PROJECTS.find((project) => project.id === projectId);

  const [projectSelectorAnchor, setProjectSelectorAnchor] = useState<HTMLButtonElement | null>(null);
  const isProjectSelectorOpen = Boolean(projectSelectorAnchor);

  const navigateBack = () => navigate(-1);

  const openProjectSelector = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setProjectSelectorAnchor(event.currentTarget);
  };

  const closeProjectSelector = () => {
    setProjectSelectorAnchor(null);
  };

  if (!project) return null;

  const TypeChipIcon = PROJECT_TYPE_META[project.type].icon;
  const statusChipColorVariant = PROJECT_STATUS_META[project.status].color;

  return (
    <>
      <MuiAppBar
        position="relative"
        color="transparent"
        elevation={0}
        sx={{ backgroundColor: "background.paper", display: "flex", flexDirection: "col", gap: 1, p: 1.5, pt: 3 }}
      >
        {config.showNotifications && <NotificationButton to="/notifications" />}

        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            {hasBackAction && <BackButton onClick={navigateBack} />}
            {startSlot}
            <Stack>
              <Typography component="div" variant="body2" fontWeight="regular" color="text.secondary">
                {overlineSlot}
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {title}
              </Typography>
              <Typography component="div" variant="body2" fontWeight="regular" color="text.secondary">
                {subtitleSlot}
              </Typography>
            </Stack>
          </Stack>

          {endSlot}
        </Stack>

        {config.showProjectSelector && (
          <Button sx={{ justifyContent: "space-between", p: 0 }} onClick={openProjectSelector} disableRipple>
            <Stack direction="row" gap={1}>
              <Folder color={theme.palette.text.secondary} size={pxToRem(18)} />
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: "initial" }}>
                {project.name}
              </Typography>
            </Stack>
            <ChevronDown color={theme.palette.text.secondary} size={pxToRem(18)} />
          </Button>
        )}
        {config.showChips && (
          <Stack direction="row" gap={2} mt={1.5}>
            <Chip label={project.status} size="small" color={statusChipColorVariant} />
            <Chip
              label={project.type}
              icon={<TypeChipIcon />}
              size="small"
              sx={{ alignSelf: "start", borderRadius: 1 }}
            />
          </Stack>
        )}

        {/* Additional AppBar Content */}
        {appBarSlots}
      </MuiAppBar>

      {/* Popovers */}
      <ProjectSelector anchorEl={projectSelectorAnchor} open={isProjectSelectorOpen} onClose={closeProjectSelector} />
    </>
  );
}

function NotificationButton({ to }: { to: string }) {
  const theme = useTheme();

  return (
    <IconButton
      component={Link}
      to={to}
      sx={{
        position: "absolute",
        right: 10,
        top: 10,
        p: 0,
      }}
    >
      <Bell size={pxToRem(20)} color={theme.palette.text.secondary} />
      <NotificationBadge badgeContent={1} color="primary" overlap="circular" />
    </IconButton>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton onClick={onClick} sx={{ p: 0 }} disableRipple>
      <ArrowLeft size={pxToRem(20)} />
    </IconButton>
  );
}
