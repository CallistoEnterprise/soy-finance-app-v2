import React, { useState } from "react";
import PageCard from "../../../../components/atoms/PageCard";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import styles from "./LiquidityHistory.module.scss";
import clsx from "clsx";
import TradeHistoryRows from "../../../../components/molecules/TradeHistoryRows";
import {useTradeHistory} from "../../../../stores/trade-history/useTradeHistory";

const itemsPerPage = 10;

export default function LiquidityHistory() {
  const {loading, add, remove} = useTradeHistory();
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const showMoreItems = () => {
    setVisibleItems(visibleItems + itemsPerPage);
  };

  const [selectedTab, setSelectedTab] = useState(0);

  const [visibleRemoveItems, setVisibleRemoveItems] = useState(itemsPerPage);
  const showMoreRemoveItems = () => {
    setVisibleRemoveItems(visibleRemoveItems + itemsPerPage);
  };

  return <PageCard>
    <PageCardHeading title="Trade history"/>

    <div className={styles.tabs}>
      <button className={clsx(styles.tab, selectedTab === 0 && styles.activeTab)} onClick={() => {
        setSelectedTab(0);
      }}>Adds</button>
      <button className={clsx(styles.tab, selectedTab === 1 && styles.activeTab)} onClick={() => {
        setSelectedTab(1);
      }}>Removes</button>
    </div>

    {selectedTab === 0 && <div className={styles.historyRows}>
      <TradeHistoryRows loading={loading} transactions={add} showMore={showMoreItems} visibleItems={visibleItems} />
    </div>}
    {selectedTab === 1 && <div className={styles.historyRows}>
    <TradeHistoryRows loading={loading} transactions={remove} showMore={showMoreRemoveItems} visibleItems={visibleRemoveItems} />
    </div>}
  </PageCard>;
}
