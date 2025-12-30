import { Chat, ReplayCircleFilled, Report, Settings } from "@mui/icons-material";
import type { ItemType } from "./ItemCard";
import type { ElementType } from "react";

export const TYPE_CONFIG: Record<ItemType, { icon: ElementType; color: string }> = {
  case: {
    icon: Report,
    color: "text.secondary",
  },
  chat: {
    icon: Chat,
    color: "components.portal.accent.blue",
  },
  service: {
    icon: Settings,
    color: "components.portal.accent.purple",
  },
  change: {
    icon: ReplayCircleFilled,
    color: "components.portal.accent.blue",
  },
};
