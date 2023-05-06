import React from "react";
import styles from "./Preloader.module.scss";
import Logo from "./Logo";
import clsx from "clsx";

interface Props {
  size?: number,
  color?: "green" | "white",
  type?: "circular" | "linear",
  withLogo?: boolean
}

export default function Preloader({ size = 100, type = "circular", color, withLogo = true }: Props) {
  switch (type) {
    case "circular":
      return <div style={{width: size, height: size}} className={styles.circularProgress}>
        <div style={{borderWidth: size > 50 ? 4 : 2}} className={styles.border} />
        {withLogo && <Logo size={size * 0.375} />}
      </div>
    case "linear":
      return <div className={styles.linearPreloader}>
        <span className={clsx(styles.circle1, styles[color])} />
        <span className={clsx(styles.circle2, styles[color])} />
        <span className={clsx(styles.circle3, styles[color])} />
      </div>
  }
}
