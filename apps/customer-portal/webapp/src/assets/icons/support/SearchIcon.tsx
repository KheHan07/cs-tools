import React from "react";
import type { IconProps } from "../../../types/icon.types";
import { BaseIcon } from "./BaseIcon";

export const SearchIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="m21 21-4.34-4.34"></path>
    <circle cx="11" cy="11" r="8"></circle>
  </BaseIcon>
);
