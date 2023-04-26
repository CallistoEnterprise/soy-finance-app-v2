import React from "react";
import styles from "./Snackbar.module.scss";
import clsx from "clsx";
import { snackbarIcons } from "./snackbarIcons";
import Svg from "../Svg/Svg";
import IconButton from "../IconButton";
import { robotoFlex } from "../../fonts";


type SnackbarSeverity = "error" | "success" | "info" | "warning";

interface Props {
  severity: SnackbarSeverity,
  message: string,
  handleClose: any
}

export default function Snackbar({ severity, message, handleClose }: Props) {
  return <div className={clsx(
    styles.customSnackbar,
    styles[severity],
    robotoFlex.className
  )}>
    <div className={styles.snackbarContainer}>
      <div className={styles.snackbarBlock}>
        <div className={styles.iconWrapper}>
          {snackbarIcons[severity]}
        </div>
        <p>
          <span className={styles.text}>
            {message}
          </span>
        </p>
      </div>
      <div className={styles.buttonWrapper}>
        <IconButton
          onClick={handleClose}
        >
          <Svg iconName="cross" />
        </IconButton>
      </div>
    </div>
  </div>;
}
