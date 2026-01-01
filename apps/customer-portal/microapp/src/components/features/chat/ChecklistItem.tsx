import { Check, CheckBox } from "@mui/icons-material";
import { Stack, Typography, type SvgIconProps } from "@mui/material";
import type { ElementType } from "react";

export function ChecklistItem({
  children,
  variant = "check",
  color = "success",
  icon,
}: {
  children: string;
  variant?: "check" | "checkbox";
  icon?: ElementType<SvgIconProps>;
  color?: SvgIconProps["color"];
}) {
  const Icon = icon ?? (variant === "checkbox" ? CheckBox : Check);

  return (
    <Stack direction="row" gap={2}>
      <Icon color={color} />
      <Typography variant="body2">{children}</Typography>
    </Stack>
  );
}
