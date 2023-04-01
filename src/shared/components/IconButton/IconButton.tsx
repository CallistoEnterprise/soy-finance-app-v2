import React, { ButtonHTMLAttributes } from "react";
import styles from "./IconButton.module.scss";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: any,
  small?: boolean,
  large?: boolean,
  className?: string | undefined,
  withBorder?: boolean,
  transparent?: boolean
}

export default function IconButton({ children, small = false, className, withBorder = false, large = false, transparent, ...props }: Props) {
  return <button className={
    clsx(
      styles.icon,
      transparent && styles.transparent,
      withBorder && styles.withBorder,
      small && styles.smallIcon,
      large && styles.large,
      className
    )} {...props}>
    {children}
  </button>;
}
