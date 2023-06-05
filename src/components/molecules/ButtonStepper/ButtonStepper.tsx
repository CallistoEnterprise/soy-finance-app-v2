import React from "react";
import styles from "./ButtonStepper.module.scss";
import Button from "../../atoms/Button";

interface Props {
  buttons: Array<{
    label: string,
    onClick: any,
  }>,
  step: number
}

export default function ButtonStepper({buttons, step}: Props) {
  return <div className={styles.rows}>
    {buttons.map((button, index) => {
      return <div key={button.label} className={styles.row}>
        <div className={styles.step}>{index + 1}</div>
        <Button fullWidth disabled={index !== step} onClick={button.onClick}>{button.label}</Button>
      </div>
    })}
  </div>;
}
