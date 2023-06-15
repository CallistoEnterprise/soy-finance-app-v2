import React from "react";
import styles from "./BannerSliderItem.module.scss";
import clsx from "clsx";

export default function BannerSliderItem({ children, width, index, active }) {
  return (
    <div className={clsx(styles.carouselItem, styles[`count${index}`], active && styles.active)} style={{ width: width }}>
      {children}
    </div>
  );
}
