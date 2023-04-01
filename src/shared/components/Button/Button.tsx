import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Button.module.scss";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: any,
  color?: "primary" | "secondary" | "outline",
  size?: "small" | "regular" | "extra-small",
  maxWidth?: number | null,
  fullWidth?: boolean
}

export default function Button({
  children,
  color = "primary",
  size = "regular",
  className = "",
  maxWidth = null,
  fullWidth = false,
  ...props
}: Props) {
  return <button style={{ maxWidth: maxWidth || "unset" }} className={
    clsx(
      styles[color],
      styles[size],
      fullWidth && styles.fullWidth,
      className
    )
  } {...props}>
    <span>{children}</span>
  </button>;
};

