import React from "react";
import { Box, Typography } from "@mui/material";

interface ProjectCardHeaderProps {
  tags: string[];
  status: {
    label: string;
    color?: string;
  };
}

const ProjectCardHeader: React.FC<ProjectCardHeaderProps> = ({
  tags,
  status,
}) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={1}
    >
      {tags.map((tag) => (
        <Box
          key={tag}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px", // rounded-md
            border: (theme) => `1px solid ${theme.palette.grey[200]}`,
            padding: "2px 8px", // px-2 py-0.5
            whiteSpace: "nowrap",
            color: "text.primary",
            "&:hover": {
              backgroundColor: (theme) => theme.palette.grey[100],
            },
            lineHeight: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontSize: "0.75rem" }}
          >
            {tag}
          </Typography>
        </Box>
      ))}

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          padding: "2px 8px", // px-2 py-0.5
          fontSize: "0.75rem", // text-xs
          fontWeight: 500,
          whiteSpace: "nowrap",
          backgroundColor: (theme) =>
            status.color === "warning"
              ? theme.palette.status.warning.background
              : status.color === "success"
              ? theme.palette.status.success.background
              : theme.palette.status.neutral.background,
          color: (theme) =>
            status.color === "warning"
              ? theme.palette.status.warning.text
              : status.color === "success"
              ? theme.palette.status.success.text
              : theme.palette.status.neutral.text,
          border: (theme) =>
            `1px solid ${
              status.color === "warning"
                ? theme.palette.status.warning.border
                : status.color === "success"
                ? theme.palette.status.success.border
                : theme.palette.status.neutral.border
            }`,
        }}
      >
        {status.label}
      </Box>
    </Box>
  );
};

export default ProjectCardHeader;
