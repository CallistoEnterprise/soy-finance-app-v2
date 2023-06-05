import React from "react";
import styles from "./BigIconWrapper.module.scss";
import Svg from "../Svg/Svg";
import {IconName} from "../Svg/svgIconsMap";

interface Props {
  iconName: IconName,
}

export default function BigIconWrapper({iconName}: Props) {
  return <div className={styles.bigIconWrapper}>
    <Svg iconName={iconName} size={84} />
  </div>;
}
