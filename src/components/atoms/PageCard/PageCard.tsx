import React from "react";
import styles from "./PageCard.module.scss";

export default function PageCard({children}) {
  return <div className="paper">
    {children}
  </div>;
}
