import React  from "react";
import clsx from "clsx";
import styles from "./Divider.module.scss";

export default function Divider() {
  return <div className={clsx(
    styles.divider
  )}
  />;
}
