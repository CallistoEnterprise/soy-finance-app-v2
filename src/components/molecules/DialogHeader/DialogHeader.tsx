import React from "react";
import styles from "./DialogHeader.module.scss";
import IconButton from "../../atoms/IconButton";
import Svg from "../../atoms/Svg/Svg";
import Divider from "../../atoms/Divider";
import clsx from "clsx";

interface Props {
  title: string,
  handleClose: any,
  variant?: "dialog" | "dropdown"
}

export default function DialogHeader({title, handleClose, variant = "dialog"}: Props) {
  return <>
    <div className={clsx(
      styles.dialogHeader,
      styles[variant]
    )}>
      <h3>{title}</h3>
      <IconButton onClick={handleClose} variant="system">
        <Svg iconName="close"/>
      </IconButton>
    </div>
    <Divider />
  </>;
}
