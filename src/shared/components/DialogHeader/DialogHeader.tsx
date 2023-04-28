import React from "react";
import styles from "./DialogHeader.module.scss";
import IconButton from "../IconButton";
import Svg from "../Svg/Svg";
import Divider from "../Divider";

export default function DialogHeader({title, handleClose}) {
  return <>
    <div className={styles.dialogHeader}>
      <h3>{title}</h3>
      <IconButton onClick={handleClose} variant="default">
        <Svg iconName="cross"/>
      </IconButton>
    </div>
    <Divider />
  </>;
}
