import React from "react";
import styles from "./TradeHistory.module.scss";
import Button from "../../../../shared/components/Button";
import Divider from "../../../../shared/components/Divider";

export default function TradeHistory() {
  return <div className="paper">
    <div className={styles.tradeHistoryHeader}>
      <h3 className="font-20 bold">Trade history</h3>
      <Button variant="text" endIcon="arrow-right">See all</Button>
    </div>
    <div className={styles.tableHeader}>
      <div>Date</div>
      <div>Pair</div>
      <div>Side</div>
      <div>Price</div>
      <div>Filled</div>
      <div>Fee</div>
      <div>Total</div>
    </div>
    <div className={styles.tableRows}>
      {[...Array(10)].map((item, index) =>{
        return <React.Fragment key={index}>
          <div className={styles.tableRow}>
            <div>16.03.2023 10:23 AM</div>
            <div>ETH/BTC</div>
            <div className={index % 2 === 0 ? styles.buy : styles.sell}>{index % 2 === 0 ? "Buy" : "Sell"}</div>
            <div>0.012823413</div>
            <div>0.144</div>
            <div>0.00013 ETH</div>
            <div>0.002312 BTC</div>
          </div>
          {index !== 9 && <Divider />}
        </React.Fragment>
      })}
    </div>
    <div className={styles.buttonWrapper}>
      <Button variant="outlined">Show more</Button>
    </div>
  </div>;
}
