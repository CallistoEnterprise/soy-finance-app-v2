import React from "react";
import styles from "./DialogHeader.module.scss";
import IconButton from "../../atoms/IconButton";
import Svg from "../../atoms/Svg/Svg";
import Divider from "../../atoms/Divider";

export default function DialogHeader({title, handleClose}) {
  return <>
    <div className={styles.dialogHeader}>
      <h3>{title}</h3>
      <IconButton onClick={handleClose} variant="default">
        <Svg iconName="close"/>
      </IconButton>
    </div>
    <Divider />
  </>;
}
