import React  from "react";
import clsx from "clsx";
import styles from "./Divider.module.scss";

interface Props {
  mode?: "dark" | "light",
  direction?: "horizontal" | "vertical",
  text?: string
}

export default function Divider({ mode = "dark",
  direction = "horizontal" }: Props) {
  return <div className={clsx(
    styles.divider,
    styles[mode],
    styles[direction]
  )}
  />;
}
