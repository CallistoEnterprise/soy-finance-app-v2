import React from "react";
import styles from "./Switch.module.scss";
import clsx from "clsx";

interface Props {
  checked: boolean,
  setChecked: any,
  small?: boolean,
  disabled?: boolean
}

export default function Switch({ checked, setChecked, small = false, disabled = false }: Props) {
  return <label className={clsx(
    styles.switch,
    small && styles.small,
    disabled && styles.disabled
  )}>
    <input disabled={disabled} checked={checked} onChange={setChecked} type="checkbox" />
    <span className={clsx(
      styles.slider,
      styles.round
    )} />
  </label>;
}
