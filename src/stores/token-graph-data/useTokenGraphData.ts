import {useEffect} from "react";
import {fetchTokenPriceData, getUnixTime, startOfHour, sub, utcCurrentTime} from "../../shared/fetcher";
import {useEvent, useStore} from "effector-react";
import {
  $tokensCandleGraphData,
  $tokensGraphData, $tokensGraphDataLoading,
  $tokensLabelsData, addLoadingTokenGraph, removeLoadingTokenGraph,
  setTokensCandleGraphData,
  setTokenGraphData, setTokensLabelsData
} from "./stores";
import {CandleGraphPoint, Timeline} from "./types";

function getTime(timeline: Timeline) {
  switch (timeline) {
    case Timeline.DAY:
      return {
        startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {days: 1}))),
        interval: 1800
      }
    case Timeline.WEEK:
      return {
        startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {weeks: 1}))),
        interval: 3600
      }
    case Timeline.MONTH:
      return {
        startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {months: 1}))),
        interval: 3600 * 4
      }
    case Timeline.YEAR:
      return {
        startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {years: 1}))),
        interval: 3600 * 24
      }
  }
}

export function useTokenGraphData({address, timeline}) {
  const tokensGraphData = useStore($tokensGraphData);
  const tokensCandleGraphData = useStore($tokensCandleGraphData);
  const labels = useStore($tokensLabelsData);
  const loadingMap = useStore($tokensGraphDataLoading);

  const setTokensGraphDataFn = useEvent(setTokenGraphData);
  const setTokensCandleGraphDataFn = useEvent(setTokensCandleGraphData);
  const setTokensLabelsDataFn = useEvent(setTokensLabelsData);

  const addLoadingTokenGraphFn = useEvent(addLoadingTokenGraph);
  const removeLoadingTokenGraphFn = useEvent(removeLoadingTokenGraph);

  useEffect(() => {
    if(tokensGraphData[address]?.[timeline] && tokensCandleGraphData[address]?.[timeline]) {
      return;
    }

    addLoadingTokenGraphFn(address);
    (async () => {
      const {interval, startTimestamp} = getTime(timeline)

      const price = await fetchTokenPriceData(address?.toLowerCase(), interval, startTimestamp);

      const dataResult: number[] = [];
      const labelsResult: Date[] = [];
      const candleDataResult: CandleGraphPoint[] = [];

      if (price.data) {
        for (const priceObj of price.data) {
          dataResult.push(priceObj.close);
          labelsResult.push(new Date(priceObj.time * 1000));
          candleDataResult.push({
            x: new Date(priceObj.time * 1000),
            o: priceObj.open,
            h: priceObj.high,
            l: priceObj.low,
            c: priceObj.close,
            s: [priceObj.open, priceObj.close]
          });
        }
      }

      setTokensGraphDataFn({address, values: dataResult, timeline});
      setTokensLabelsDataFn({address, values: labelsResult, timeline});
      setTokensCandleGraphDataFn({address, values: candleDataResult, timeline});

      removeLoadingTokenGraphFn(address);
    })();
  }, [addLoadingTokenGraphFn, address, removeLoadingTokenGraphFn, setTokensCandleGraphDataFn, setTokensGraphDataFn, setTokensLabelsDataFn, timeline, tokensCandleGraphData, tokensGraphData]);

  return {
    data: tokensGraphData[address]?.[timeline],
    candleData: tokensCandleGraphData[address]?.[timeline],
    labels: labels[address]?.[timeline],
    loading: loadingMap.includes(address)
  };
}
