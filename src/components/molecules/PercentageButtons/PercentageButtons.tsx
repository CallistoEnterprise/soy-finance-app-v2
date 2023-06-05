import React from "react";
import styles from "./PercentageButtons.module.scss";
import Button from "../../atoms/Button";

interface Props {
  handleClick: (value: string) => void,
  balance: number,
  inputValue: string,
  fullWidth?: boolean
}

export default function PercentageButtons({balance, inputValue, handleClick, fullWidth}: Props) {
  return <div className={styles.partButtons}>
    {[0.25, 0.5, 0.75, 1].map((part, index) => {
      return <Button key={part} onClick={() => {
        handleClick((balance * part).toString());
      }} active={(balance * part).toString() === inputValue} variant="outlined" fullWidth={fullWidth} size="small">{part === 1 ? "Max" : `${100 * part}%`}</Button>
    })}
  </div>;
}
