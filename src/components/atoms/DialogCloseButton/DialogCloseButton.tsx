import React from "react";
import styles from "./DialogCloseButton.module.scss";
import Svg from "../Svg/Svg";

interface Props {
  handleClose: any
}

export default function DialogCloseButton({ handleClose }: Props) {
  return <button className={styles.closeButton} onClick={handleClose}>
   <Svg iconName="close" />
  </button>;
}
