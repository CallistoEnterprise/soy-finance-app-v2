import React, {ReactNode} from "react";
import styles from "./InfoRow.module.scss";

interface Props {
  label: string,
  onEdit?: () => any,
  tooltip?: string,
  value: string | ReactNode
}

export default function InfoRow({label, onEdit, tooltip, value}: Props) {
  return <div className={styles.infoRow}>
    <span>{label}</span>
    {typeof value === "string" ? <span className={styles.value}>
            {value}
        </span> : <>{value}</>}
  </div>;
}
