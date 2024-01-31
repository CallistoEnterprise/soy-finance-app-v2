import { useEffect } from "react";
import { CandleGraphPoint, Timeline } from "@/app/[locale]/swap/stores/types";
import { fetchTokenPriceData, getUnixTime, startOfHour, utcCurrentTime } from "@/other/fetchRecentTransactions";
import { useTokenGraphStore } from "@/app/[locale]/swap/stores/graph";

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}
function sub(date: Date | number, duration: Duration): Date {
  const newDate = new Date(date);
  const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
  newDate.setFullYear(newDate.getFullYear() - years);
  newDate.setMonth(newDate.getMonth() - months);
  newDate.setDate(newDate.getDate() - (weeks * 7) - days);
  newDate.setHours(newDate.getHours() - hours);
  newDate.setMinutes(newDate.getMinutes() - minutes);
  newDate.setSeconds(newDate.getSeconds() - seconds);
  return newDate;
}
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
export default function useTokenGraphData({address, timeline}: {address: `0x${string}` | string, timeline: Timeline}) {
  const {
    addLoadingTokenGraph,
    tokensGraphData,
    tokensCandleGraphData,
    setTokenGraphData,
    setCandleGraphData,
    tokensGraphDataLoading,
    tokensLabelData,
    setTokensLabelsData,
    removeLoadingTokenGraph
  } = useTokenGraphStore();

  useEffect(() => {
    if(!address) {
      return;
    }

    if(tokensGraphData[address]?.[timeline] && tokensCandleGraphData[address]?.[timeline]) {
      return;
    }

    addLoadingTokenGraph(address);
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

      setTokenGraphData({address, values: dataResult, timeline});
      setTokensLabelsData({address, values: labelsResult, timeline});
      setCandleGraphData({address, values: candleDataResult, timeline});

      removeLoadingTokenGraph(address);
    })();
  }, [addLoadingTokenGraph, address, removeLoadingTokenGraph, setCandleGraphData, setTokenGraphData, setTokensLabelsData, timeline, tokensCandleGraphData, tokensGraphData]);

  return {
    data: tokensGraphData[address]?.[timeline],
    candleData: tokensCandleGraphData[address]?.[timeline],
    labels: tokensLabelData[address]?.[timeline],
    loading: tokensGraphDataLoading.includes(address)
  };
}
