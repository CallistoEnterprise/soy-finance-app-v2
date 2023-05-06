import React from "react";
import clsx from "clsx";

interface Props {
  tag?: keyof JSX.IntrinsicElements,
  variant?: 12 | 14 | 16 | 18 | 20 | 24,
  color?: "primary" | "secondary",
  weight?: 400 | 700
  children,
}

export default function Text({tag = "span", variant = 16, weight = 400, color = "primary", children}: Props) {
  const Tag = tag as keyof JSX.IntrinsicElements;

  return <Tag className={clsx(
    `font-${variant}`,
    `font-${color}`,
    `font-${weight}`
  )}>{children}</Tag>;
}
