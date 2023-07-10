import {useEffect} from "react";
import {useEvent, useStore} from "effector-react";
import {$isTradeHistoryLoaded, $tradeHistory, setTradeHistory, setTradeHistoryLoaded} from "./stores";
import {fetchTopTransactions} from "../../shared/fetcher";

export function useTradeHistory() {
  const tradeHistory = useStore($tradeHistory);
  const isTradeHistoryLoaded = useStore($isTradeHistoryLoaded);
  const setTradeHistoryLoadedFn = useEvent(setTradeHistoryLoaded);
  const setTradeHistoryFn = useEvent(setTradeHistory);


  useEffect(() => {
      const fetch = async () => {
        try {
          const lastTransactions = await fetchTopTransactions();
          if (lastTransactions) {
            setTradeHistoryFn(lastTransactions);
          }
        } catch (e) {
          console.error("Error: error while fetching transactions history");
        } finally {
          setTradeHistoryLoadedFn(true);
        }
      }
      if (!isTradeHistoryLoaded) {
        fetch();
      }
  }, [isTradeHistoryLoaded, setTradeHistoryLoadedFn, tradeHistory]);

  return {
    loading: !isTradeHistoryLoaded,
    add: tradeHistory.add,
    remove: tradeHistory.remove,
    swap: tradeHistory.swap
  };
}
