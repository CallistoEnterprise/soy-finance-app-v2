import { useState } from "react";
import React from "react";
import { itemsPerPage, TradeHistoryRows, useTradeHistory } from "@/components/history";
import CloseIconButton from "@/components/buttons/CloseIconButton";
import { useTranslations } from "use-intl";

export default function TradeHistory({handleClose}: {handleClose?: () => void}) {
  const t = useTranslations("Swap");

  const {loading, swap} = useTradeHistory();
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const showMoreItems = () => {
    setVisibleItems(visibleItems + itemsPerPage);
  };

  return <div className="lg:rounded-5 lg:border-y sm:border border-primary-border bg-primary-bg">
    <div className="flex justify-between items-center pl-4 lg:pl-5 lg:pt-6 lg:pb-0 pr-2 py-2 border-b lg:border-0 border-primary-border overflow-hidden">
      <h2 className="text-24 font-bold">{t("trade_history")}</h2>
      {handleClose && <div className="lg:hidden">
        <CloseIconButton handleClose={handleClose} />
      </div>}
    </div>

    <div className="p-4 lg:p5 max-h-[calc(80vh-57px)] overflow-scroll lg:max-h-none">
      <TradeHistoryRows loading={loading} transactions={swap} showMore={showMoreItems} visibleItems={visibleItems} />
    </div>
  </div>;
}
