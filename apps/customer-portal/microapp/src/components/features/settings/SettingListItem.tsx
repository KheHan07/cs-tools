import type { ComponentType, ReactNode } from "react";
import { ChevronRight } from "@mui/icons-material";
import { Stack, SvgIcon, Typography, type SvgIconProps } from "@mui/material";

export function SettingListItem({
  name,
  value,
  icon,
  iconColor,
  iconBackgroundColor,
  description,
  suffix,
}: {
  name: string;
  icon: ComponentType<SvgIconProps>;
  iconColor?: string;
  iconBackgroundColor?: string;
  value?: string;
  description?: string;
  suffix?: "chevron" | ReactNode;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ cursor: "pointer" }} p={1.5}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Stack
          width={40}
          height={40}
          alignItems="center"
          justifyContent="center"
          borderRadius={1}
          bgcolor={iconBackgroundColor}
        >
          <SvgIcon sx={(theme) => ({ fontSize: theme.typography.pxToRem(22), color: iconColor })} component={icon} />
        </Stack>
        <Stack>
          {value && (
            <Typography variant="caption" color="text.secondary">
              {name}
            </Typography>
          )}

          <Typography variant="body1">{value ?? name}</Typography>

          {description && (
            <Typography variant="caption" fontWeight="regular" color="text.secondary">
              {description}
            </Typography>
          )}
        </Stack>
      </Stack>
      {suffix && suffix === "chevron" ? <ChevronRight sx={{ color: "text.tertiary" }} /> : suffix}
    </Stack>
  );
}
