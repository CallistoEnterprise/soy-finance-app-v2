import React from "react";
import styles from "./Farms.module.scss";

export default function Farms() {
  return <div className="container">
    <div className="paper">
      <h4 className="mb-20 font-700 font-24">All farms</h4>
      <div className={styles.farmsContainer}>
        <div className={styles.farm}>
          Farm 1
        </div>
        <div className={styles.farm}>
          Farm 2
        </div>
        <div className={styles.farm}>
          Farm 3
        </div>
        <div className={styles.farm}>
          Farm 4
        </div>
      </div>
    </div>
  </div>;
}
