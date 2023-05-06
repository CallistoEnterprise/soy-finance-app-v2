import React from "react";
import styles from "./InputWithUnits.module.scss";

export default function InputWithUnits({units, value, setValue}) {
  return <div className={styles.inputWithUnits}>
    <input className={styles.input} value={value.toString()} onChange={(e) => {
      setValue(+e.target.value);
    }} type="text"/>
    <div className={styles.units}>{units}</div>
  </div>;
}
