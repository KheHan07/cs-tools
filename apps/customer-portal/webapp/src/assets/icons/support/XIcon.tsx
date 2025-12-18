import React from "react";
import type { IconProps } from "../../../types/icon.types";
import { BaseIcon } from "./BaseIcon";

export const XIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </BaseIcon>
);
