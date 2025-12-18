import React from "react";
import { Typography } from "@mui/material";

interface ProjectCardInfoProps {
  title: string;
  subtitle: string;
}

const ProjectCardInfo: React.FC<ProjectCardInfoProps> = ({
  title,
  subtitle,
}) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{
          color: "text.primary",
          marginBottom: "8px",
          transition: "color 0.15s",
          ".group:hover &": {
            color: (theme) => theme.palette.primary.main,
          },
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          fontSize: "0.875rem", // text-sm
          display: "-webkit-box",
          WebkitLineClamp: 2, // line-clamp-2
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {subtitle}
      </Typography>
    </>
  );
};

export default ProjectCardInfo;
