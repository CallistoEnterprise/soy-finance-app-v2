import React from "react";

export const svgIconsNames = [
  "earth",
  "wallet",
  "expand-arrow",
  "history",
  "logout",
  "cross",
  "info",
  "done",
  "warning",
  "error",
  "checkmark",
  "arrow-right",
  "plus",
  "filters",
  "swap",
  "arrow-up",
  "twitter",
  "defilama",
  "telegram",
  "reddit",
  "coinpaprika",
  "coingecko",
  "coinmarketcup",
  "gitbook",
  "facebook",
  "arrow-next",
  "search",
  "no-transactions"
] as const;

export type IconName = typeof svgIconsNames[number];
