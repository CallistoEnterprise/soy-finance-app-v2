import React, { useCallback, useEffect, useState } from "react";
import { fetchTopTransactions, Transaction } from "@/other/fetchRecentTransactions";
import { tokenListInCLO } from "@/config/token-lists/tokenListInCLO";
import Skeleton from "@/components/atoms/Skeleton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import HistoryItem from "@/components/HistoryItem";
import { useMediaQuery } from "react-responsive";
import ExternalLink from "@/components/atoms/ExternalLink";
import Svg from "@/components/atoms/Svg";


export function useTradeHistory() {
  const [tradeHistory, setTradeHistory] = useState<{
    add: Transaction[],
    remove: Transaction[],
    swap: Transaction[]
  }>({
    add: [],
    remove: [],
    swap: []
  });
  const [isTradeHistoryLoaded, setTradeHistoryLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const lastTransactions = await fetchTopTransactions();
        if (lastTransactions) {
          setTradeHistory(lastTransactions);
        }
      } catch (e) {
        console.error("Error: error while fetching transactions history");
      } finally {
        setTradeHistoryLoaded(true);
      }
    }
    if (!isTradeHistoryLoaded) {
      fetch();
    }
  }, [isTradeHistoryLoaded, tradeHistory]);

  return {
    loading: !isTradeHistoryLoaded,
    add: tradeHistory.add,
    remove: tradeHistory.remove,
    swap: tradeHistory.swap
  };
}

export const itemsPerPage = 10;

function LoadingStatePlaceholder() {
  return <>
    <div className="bg-secondary-bg pt-4 pb-5 px-5 rounded-2 sm:hidden">
      <div className="flex flex-col gap-2.5 mb-2.5">
        <div className="flex justify-between items-center">
          <div>Swap action</div>
          <div>
            <Skeleton white />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Account</div>
          <div>
            <Skeleton white />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Total value</div>
          <div><Skeleton white /></div>
        </div>
        <div className="flex justify-between items-center">
          <div>Time</div>
          <div><Skeleton white /></div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2 text-14">
        <Skeleton />
        <Svg iconName="arrow-right"/>
        <div className="flex justify-end"><Skeleton /></div>
      </div>
    </div>

    <div className="bg-secondary-bg pt-4 pb-5 px-5 rounded-2 hidden lg:block xl:hidden">
      <div className="flex flex-col gap-2.5 mb-2.5">
        <div className="flex justify-between items-center">
          <div>Swap action</div>
          <div>
            <Skeleton white />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Account</div>
          <div>
            <Skeleton white />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Total value</div>
          <div><Skeleton white /></div>
        </div>
        <div className="flex justify-between items-center">
          <div>Time</div>
          <div><Skeleton white /></div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2">
        <Skeleton />
        <Svg iconName="arrow-right"/>
        <div className="flex justify-end"><Skeleton /></div>
      </div>
    </div>

    <div className="hidden xl:block">
      <div className="grid grid-cols-history p-5 text-primary-text">
        <div>
          <Skeleton />
        </div>
        <div><Skeleton /></div>
        <div><Skeleton /></div>
        <div><Skeleton /></div>
        <div>
          <Skeleton />
        </div>
        <div><Skeleton /></div>
      </div>
      <div className="bg-primary-border w-full h-[1px]"/>
    </div>

    <div className="hidden md:block lg:hidden bg-secondary-bg pt-4 pb-5 px-5 rounded-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div>Swap action</div>
          <div>
            <Skeleton white />
          </div>
        </div>
        <div>
          <div>Account</div>
          <div>
            <Skeleton white />
          </div>
        </div>
        <div>
          <div>Total value</div>
          <div><Skeleton white /></div>
        </div>
        <div>
          <div>Time</div>
          <div><Skeleton white /></div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2">
        <Skeleton />
        <Svg iconName="arrow-right"/>
        <div className="flex justify-end"><Skeleton /></div>
      </div>
    </div>
  </>
}

export function TradeHistoryRows({transactions, visibleItems, showMore, loading}: {
  transactions: Transaction[],
  visibleItems: number,
  showMore: () => void,
  loading: boolean
}) {

  if(loading) {
    return <>
      <div className="hidden xl:grid grid-cols-history p-5 bg-secondary-bg rounded-2.5 mt-5 text-primary-text">
        <div>Swap action</div>
        <div>Total</div>
        <div>Amount</div>
        <div>Amount</div>
        <div>Account</div>
        <div>Time</div>
      </div>
      <div className="flex flex-col text-16 gap-2 sm:gap-2.5 xl:gap-0">
        {[...Array(10)].map((item, index) => {
          return <LoadingStatePlaceholder key={index} />
        })}
      </div>
      <div className="text-center mt-5">
        <span className="inline-block h-10 w-[143px] bg-secondary-bg rounded-25" />
      </div>
    </>
  }

  return <>
    <div className="hidden xl:grid grid-cols-history p-5 bg-secondary-bg rounded-2.5 mt-5 text-primary-text">
      <div>Swap action</div>
      <div>Total</div>
      <div>Amount</div>
      <div>Amount</div>
      <div>Account</div>
      <div>Time</div>
    </div>
    <div className="flex flex-col text-16 gap-2 sm:gap-2.5 xl:gap-0">
      {transactions && transactions.slice(0, visibleItems).map((item, index) => {
        return <HistoryItem loading={loading} item={item} key={index} index={index} visibleItems={visibleItems} />
      })}
    </div>
    {visibleItems < transactions?.length && (
      <div className="flex justify-center mt-5">
        <PrimaryButton onClick={showMore} variant="outlined">Show more</PrimaryButton>
      </div>
    )}
  </>;
}
