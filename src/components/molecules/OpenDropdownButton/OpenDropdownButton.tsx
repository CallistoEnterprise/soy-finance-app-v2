import React, {ReactNode} from "react";
import styles from "./OpenDropdownButton.module.scss";
import Image from "next/image";
import clsx from "clsx";
import Svg from "../../atoms/Svg/Svg";
import Text from "../../atoms/Text";

interface Props {
  handleClick: () => void,
  label: string,
  isOpened: boolean,
  img?: string | ReactNode
}

export default function OpenDropdownButton({handleClick, label, isOpened, img}: Props) {
  return <button className={styles.dropdownButton} color="secondary" onClick={handleClick}>
                <span className={styles.buttonContent}>
                  {img &&
                  <span className={styles.imageWrapper}>
                    {typeof img === "string"
                      ? <Image width={24} height={24} src={img} alt="Currently picked network"/>
                      : img}
                  </span>}
                  <span className={styles.label}>{label}</span>
                  <span className={clsx(
                    styles.expandArrow,
                    isOpened && styles.opened)
                  }><Svg size={24} iconName="arrow-bottom"/></span>
                </span>
  </button>;
}
