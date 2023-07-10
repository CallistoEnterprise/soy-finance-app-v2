import React, { ButtonHTMLAttributes } from "react";
import styles from "./IconButton.module.scss";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: any,
  variant?: "menu" | "action" | "social" | "default" | "system",
  readonly?: boolean
}

export default function IconButton({ children, variant = "default", readonly = false, ...props }: Props) {
  return <button className={
    clsx(
      styles.icon,
      styles[variant],
      readonly && styles.readonly
    )} {...props}>
    {children}
  </button>;
}
