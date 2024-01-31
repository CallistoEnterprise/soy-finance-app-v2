import React, { useState } from "react";
import clsx from "clsx";
import { TradeHistoryRows, useTradeHistory } from "@/components/history";
import PageCard from "@/components/PageCard";

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
    <h2 className="text-24 font-bold">Trade history</h2>

    <div className="inline-flex border border-primary-border gap-0.5 p-[1px] rounded-2 mt-[22px] mb-5 xl:mb-0">
      <button className={clsx("text-16 h-9 px-4 rounded-[6px] min-w-[105px]", selectedTab === 0 ? "bg-green text-white" : "text-primary-text")} onClick={() => {
        setSelectedTab(0);
      }}>Adds</button>
      <button className={clsx("text-16 h-9 px-4 rounded-[6px] min-w-[105px]", selectedTab === 1 ? "bg-green text-white" : "text-primary-text")} onClick={() => {
        setSelectedTab(1);
      }}>Removes</button>
    </div>

    {selectedTab === 0 && <div className="">
      <TradeHistoryRows loading={loading} transactions={add} showMore={showMoreItems} visibleItems={visibleItems} />
    </div>}
    {selectedTab === 1 && <div className="">
      <TradeHistoryRows loading={loading} transactions={remove} showMore={showMoreRemoveItems} visibleItems={visibleRemoveItems} />
    </div>}
  </PageCard>;
}
