import React from "react";
import clsx from "clsx";
import {Property} from "csstype";
import TextAlign = Property.TextAlign;

interface Props {
  tag?: keyof JSX.IntrinsicElements,
  variant?: 12 | 14 | 16 | 18 | 20 | 24 | 28,
  color?: "primary" | "secondary",
  weight?: 400 | 500 | 600 | 700,
  align?: TextAlign
  children,
}

export default function Text({tag = "span", variant = 16, weight = 500, color = "primary", align = "left", children}: Props) {
  const Tag = tag as keyof JSX.IntrinsicElements;

  return <Tag className={clsx(
    `font-${variant}`,
    `font-${color}`,
    `font-${weight}`
  )} style={{textAlign: align}}>{children}</Tag>;
}
