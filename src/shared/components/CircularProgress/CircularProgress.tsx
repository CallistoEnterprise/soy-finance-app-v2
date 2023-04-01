import React from "react";
import styles from "./CircularProgress.module.scss";

interface Props {
  size?: number,
  color?: string
}

export default function CircularProgress({ size = 25, color = "#6DA316" }: Props) {
  return <div className={styles.MuiCircularProgressIndeterminate} role="progressbar" style={{
    width: size,
    height: size
  }}>
    <svg viewBox="22 22 44 44">
      <circle className={styles.MuiCircularProgressCircleIndeterminate} cx="44" cy="44" r="20.2" fill="none" stroke={color}
        strokeWidth="3.6"/>
    </svg>
  </div>;
}
