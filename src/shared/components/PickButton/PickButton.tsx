import React from "react";
import styles from "./PickButton.module.scss";
import Checkmark from "../Checkmark";
import clsx from "clsx";

interface Props {
  children: any,
  onClick: any,
  isActive: boolean,
  withCheckmark?: boolean,
  view?: "card" | "list"
}

export default function PickButton({
   children,
   onClick,
   isActive,
   withCheckmark = false,
   view = "list"
 }: Props) {
  return <button onClick={onClick} className={clsx(
    styles.pickButton,
    view === "card" && styles.card,
    isActive && styles.active
  )}>
    {children}
    {withCheckmark && <Checkmark isChecked={isActive}/>}
  </button>;
}
