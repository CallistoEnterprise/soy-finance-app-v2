import React from "react";

export const svgIconsNames = [
  "earth",
  "wallet",
  "expand-arrow",
  "history",
  "logout",
  "cross"
] as const;

export type IconName = typeof svgIconsNames[number];
