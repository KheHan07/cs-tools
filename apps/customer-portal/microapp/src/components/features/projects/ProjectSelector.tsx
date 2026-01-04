import { Box, Popover, Stack, Typography, type PopoverProps } from "@mui/material";
import { ProjectPopoverItem } from "@components/features/projects";
import { useProject } from "@context/project";
import { MOCK_PROJECTS } from "@root/src/mocks/data/projects";

export function ProjectSelector({ open, anchorEl, onClose }: PopoverProps) {
  const { projectId, setProjectId } = useProject();

  return (
    <Popover
      component={Box}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      elevation={0}
      slotProps={{
        paper: {
          sx: (theme) => ({
            py: 2,
            width: "100%",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
          }),
        },
      }}
    >
      <Typography
        color="text.secondary"
        fontWeight="medium"
        sx={(theme) => ({ fontSize: theme.typography.pxToRem(13) })}
        px={2}
      >
        Select Project
      </Typography>
      <Stack gap={1} pt={1}>
        {MOCK_PROJECTS.map((props) => (
          <ProjectPopoverItem
            {...props}
            active={props.id === projectId}
            onClick={() => {
              setProjectId(props.id);
              onClose?.({}, "backdropClick");
            }}
          />
        ))}
      </Stack>
    </Popover>
  );
}
