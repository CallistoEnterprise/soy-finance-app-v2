import React from "react";
import styles from "./Flex.module.scss";

export default function Flex({gap, children}) {
  return <div style={{gap}} className={styles.flex}>
    {children}
  </div>;
}
