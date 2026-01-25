import { styled } from "@mui/material";
import MuiChip, { type ChipProps } from "@mui/material/Chip";
import type { Priority, Status } from "./ItemCard";
import { capitalize } from "@utils/others";

interface PriorityChipProps extends Omit<ChipProps, "label"> {
  prefix?: string;
  priority: Priority;
}

const StyledPriorityChip = styled(MuiChip, {
  shouldForwardProp: (prop) => prop !== "prefix" && prop !== "priority",
})<PriorityChipProps>(({ theme, priority }) => ({
  // color: theme.palette.components.priority[priority].text,
  // backgroundColor: theme.palette.components.priority[priority].background,
}));

export function PriorityChip({ prefix, priority, ...props }: PriorityChipProps) {
  return (
    <StyledPriorityChip
      priority={priority}
      label={`${prefix ? `${prefix}: ` : ""}${capitalize(priority)}`}
      {...props}
    />
  );
}

interface StatusChipProps extends Omit<ChipProps, "label"> {
  status: Status;
}
const StyledStatusChip = styled(MuiChip, {
  shouldForwardProp: (prop) => prop !== "status",
})<StatusChipProps>(({ theme, status }) => ({
  // color: theme.palette.components.status[status].text,
  // backgroundColor: theme.palette.components.status[status].background,
  borderRadius: 3,
}));

export function StatusChip({ status, ...props }: StatusChipProps) {
  return <StyledStatusChip status={status} label={capitalize(status)} {...props} />;
}
