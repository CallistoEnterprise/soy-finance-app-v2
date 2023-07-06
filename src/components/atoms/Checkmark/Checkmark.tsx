import React from "react";
import styles from "./Checkmark.module.scss";
import clsx from "clsx";
import Svg from "../Svg";

export default function Checkmark({isChecked}) {
  return <span className={clsx(
    styles.checkmark,
    isChecked && styles.isChecked
  )}>
    {isChecked && <Svg iconName="check" />}
  </span>;
}
