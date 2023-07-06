import React from "react";
import styles from "./EmptyStateIcon.module.scss";
import Svg from "../Svg/Svg";
import {IconName} from "../Svg/svgIconsMap";

interface Props {
  iconName: IconName,
}

export default function EmptyStateIcon({iconName}: Props) {
  return <div className={styles.emptyStateIcon}>
    <Svg iconName={iconName} size={84} />
  </div>;
}
