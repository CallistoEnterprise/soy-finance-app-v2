import React, {ReactNode} from "react";
import styles from "./DropdownItem.module.scss";
import clsx from "clsx";
import Image from "next/image";

interface Props {
  handleClick: () => any,
  isActive?: boolean,
  label: string,
  image?: string | ReactNode
}

export default function DropdownItem({handleClick, isActive = false, label, image}: Props) {
  return  <div role="button" onClick={handleClick} className={clsx(
    styles.networkItem,
    isActive && styles.active
  )}>
    {image && <span className={styles.imageWrapper}>
      {typeof image === "string"
        ? <Image width={24} height={24} src={image} alt="Currently picked network"/>
        : image
      }
    </span>}
     {label}
  </div>;
}
