import React from "react";
import type { IconProps } from "../../../types/icon.types";
import { BaseIcon } from "./BaseIcon";

export const TrendingUpIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M16 7h6v6"></path>
    <path d="m22 7-8.5 8.5-5-5L2 17"></path>
  </BaseIcon>
);
