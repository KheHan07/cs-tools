import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { WidgetBox } from "@components/ui";

export interface MetricWidgetProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  size?: "small" | "large";
  base?: boolean;
  trend?: {
    direction: "up" | "down";
    value: number | string;
  };
}

export function MetricWidget({ label, value, icon, size, base, trend }: MetricWidgetProps) {
  const small = size === "small";
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <WidgetBox>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {!base && icon}

        {trend && !base && (
          <Stack direction="row" gap={0.5} alignItems="center">
            <TrendIcon sx={{ color: "components.portal.accent.green" }} />
            <Typography variant="body2" fontWeight="medium" sx={{ color: "components.portal.accent.green" }}>
              {trend.value}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Typography variant={small ? "h4" : "h3"} fontWeight="bold">
        {value}
      </Typography>

      <Typography variant={small ? "subtitle1" : "h6"} fontWeight="medium" color="text.secondary">
        {label}
      </Typography>
    </WidgetBox>
  );
}
