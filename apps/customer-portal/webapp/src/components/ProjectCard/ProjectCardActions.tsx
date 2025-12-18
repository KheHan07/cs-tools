import React from "react";
import { Button } from "@mui/material";
import { ArrowForward as ArrowRightIcon } from "@mui/icons-material";

interface ProjectCardActionsProps {
  onViewDashboard?: () => void;
}

const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  onViewDashboard,
}) => {
  return (
    <Button
      disableRipple
      onClick={onViewDashboard}
      sx={{
        width: "100%",
        backgroundColor: "transparent",
        color: "text.primary",
        border: (theme) => `1px solid ${theme.palette.grey[200]}`,
        borderRadius: "6px", // rounded-md
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.875rem",
        padding: "8px 16px", // px-4 py-2
        justifyContent: "center",
        gap: "8px",
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: (theme) => theme.palette.grey[100],
        },
        ".group:hover &": {
          backgroundColor: (theme) => theme.palette.primary.main,
          color: "white",
          borderColor: (theme) => theme.palette.primary.main,
        },
      }}
    >
      View Dashboard
      <ArrowRightIcon
        sx={{
          width: 16,
          height: 16,
          transition: "transform 0.2s",
          ".group:hover &": {
            transform: "translateX(4px)", // group-hover:translate-x-1
          },
        }}
      />
    </Button>
  );
};

export default ProjectCardActions;
