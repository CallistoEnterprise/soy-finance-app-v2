import React from "react";
import styles from "./Checkbox.module.scss";
import Svg from "../Svg/Svg";

interface Props {
  checked: boolean,
  handleChange: any,
  id: string
}

export default function Checkbox({ checked, handleChange, id }: Props) {
  return <div className={styles.wrapper}>
    <input
      checked={checked}
      onChange={handleChange}
      className={styles.checkboxInput}
      id={id}
      type="checkbox"
    />
    <label className={styles.checkbox} htmlFor={id}>
      <span>
        <Svg iconName="checkmark" />
      </span>
    </label>
  </div>;
}
