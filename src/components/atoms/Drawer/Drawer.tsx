import React from "react";
import clsx from "clsx";
import styles from "./Drawer.module.scss";
import Portal from "../Portal";

interface Props {
  isOpen: boolean,
  children: any,
  className?: string,
  onClose: () => void,
  position: "left" | "right" | "top" | "bottom",
  width?: number,
}

export default function Drawer({
  isOpen,
  children,
  onClose,
  position = "left",
  width = 300
}: Props) {
  return <Portal className={clsx(
    styles.drawerContainer,
    isOpen && styles.open
  )} root="drawer-root" onClose={onClose} isOpen={isOpen} isTransitioningClassName={styles.in}>
    <div className={clsx(
      styles.drawer,
      styles[position]
    )} style={{ width: position === "left" || position === "right" ? width : "100%" }} role="dialog">
      {children}
    </div>
    <div className={styles.backdrop} onClick={onClose} />
  </Portal>;
}
