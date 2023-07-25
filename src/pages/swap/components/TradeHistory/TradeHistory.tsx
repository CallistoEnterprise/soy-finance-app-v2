import React, { useState } from "react";
import styles from "./TradeHistory.module.scss";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import TradeHistoryRows from "../../../../components/molecules/TradeHistoryRows";
import {useTradeHistory} from "../../../../stores/trade-history/useTradeHistory";

const itemsPerPage = 10;

export default function TradeHistory() {
  const {loading, swap} = useTradeHistory();
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const showMoreItems = () => {
    setVisibleItems(visibleItems + itemsPerPage);
  };

  console.log(swap);

  return <div className={styles.paper}>
    <PageCardHeading title="Trade history"/>

    <div className={styles.historyRows}>
      <TradeHistoryRows loading={loading} transactions={swap} showMore={showMoreItems} visibleItems={visibleItems} />
    </div>
  </div>;
}
