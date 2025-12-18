import React from "react";
import { Card, Typography, Box, Button } from "@mui/material";
import {
  ErrorOutlineOutlined as AlertCircleIcon, // Closest to lucide-circle-alert
  ChatBubbleOutlineOutlined as MessageSquareIcon, // Closest to lucide-message-square
  CalendarTodayOutlined as CalendarIcon, // Closest to lucide-calendar
  ArrowForward as ArrowRightIcon,
} from "@mui/icons-material";
import { useRouter } from "../hooks/useRouter";

export interface ProjectCardProps {
  sysId: string;
  title: string;
  subtitle: string;
  tags: string;
  openCases: number;
  activeChats: number;
  status: string;
  date: string;
  onViewDashboard?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  sysId,
  title,
  subtitle,
  tags,
  status,
  openCases,
  activeChats,
  date,
  onViewDashboard,
}) => {
  const router = useRouter();

  const handleViewDashboard = () => {
    if (onViewDashboard) {
      onViewDashboard();
    } else {
      // Navigate to dashboard with sys_id
      router.push(`/${sysId}/dashboard`);
    }
  };
  return (
    <Card
      className="group" // For group-hover effects
      sx={{
        //width: '100%', // Fluid width to fit grid
        borderRadius: "12px", // rounded-xl
        padding: "24px", // p-6
        display: "flex",
        flexDirection: "column",
        gap: "24px", // gap-6
        boxShadow: "none",
        border: (theme) => `2px solid ${theme.palette.grey[200]}`,
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // shadow-lg
          borderColor: (theme) => theme.palette.primary.light,
        },
      }}
    >
      <Box mb={2}>
        {/* Header Badges */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Box
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
              {tags}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              padding: "2px 8px", // px-2 py-0.5
              fontSize: "0.75rem", // text-xs
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
              backgroundColor: (theme) =>
                status === "All Good"
                  ? theme.palette.status.success.background
                  : status === "Needs Attention"
                  ? theme.palette.status.warning.background
                  : theme.palette.status.neutral.background,
              color: (theme) =>
                status === "All Good"
                  ? theme.palette.status.success.text
                  : status === "Needs Attention"
                  ? theme.palette.status.warning.text
                  : theme.palette.status.neutral.text,
              border: (theme) =>
                `1px solid ${
                  status === "All Good"
                    ? theme.palette.status.success.border
                    : status === "Needs Attention"
                    ? theme.palette.status.warning.border
                    : theme.palette.status.neutral.border
                }`,
            }}
          >
            {status}
          </Box>
        </Box>

        {/* Title & Subtitle */}
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
            minHeight: "40px",
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Stats Divider Section */}
      <Box
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.grey[100]}`,
          paddingBottom: "16px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Open Cases */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          fontSize="0.875rem"
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            color="text.secondary"
          >
            <AlertCircleIcon sx={{ width: 16, height: 16 }} />
            <Typography variant="body2" color="inherit">
              Open Cases
            </Typography>
          </Box>
          {/* Finding the stat value for Open Cases */}
          <Typography variant="body2" fontWeight={500} color="primary.main">
            {openCases}
          </Typography>
        </Box>

        {/* Active Chats */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          fontSize="0.875rem"
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            color="text.secondary"
          >
            <MessageSquareIcon sx={{ width: 16, height: 16 }} />
            <Typography variant="body2" color="inherit">
              Active Chats
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={500} color="secondary.main">
            {activeChats}
          </Typography>
        </Box>

        {/* Date */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          color="text.secondary"
          fontSize="0.875rem"
        >
          <CalendarIcon sx={{ width: 16, height: 16 }} />
          <Typography variant="body2" color="inherit">
            {date}
          </Typography>
        </Box>
      </Box>

      {/* Footer Button */}
      <Button
        disableRipple
        onClick={handleViewDashboard}
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
    </Card>
  );
};

export default ProjectCard;
