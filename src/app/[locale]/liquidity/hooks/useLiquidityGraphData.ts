import {useEffect, useMemo, useState} from "react";
import { fetchChartData, getOverviewChartData } from "@/other/fetchRecentTransactions";
import { useLiquidityGraphStore } from "@/app/[locale]/liquidity/stores/useLiquidityGraphDataStore";

export function useLiquidityGraphData(locale: string) {
  const {
    liquidityGraphData,
    liquidityLabelsData,
    liquidityGraphDataLoaded,
    setLiquidityGraphData,
    setLiquidityLabelsData,
    setLiquidityGraphDataLoaded
  } = useLiquidityGraphStore();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await fetchChartData(getOverviewChartData)
      if (data) {
        const dataResult = [];
        const labelsResult = [];

        for (const item of data) {
          dataResult.push(item.liquidityUSD.toString());
          labelsResult.push(new Date(item.date * 1000));
        }

        setLiquidityGraphData(dataResult);
        setLiquidityLabelsData(labelsResult);
      }
      setLiquidityGraphDataLoaded();
    }
    if (!liquidityGraphDataLoaded) {
      fetch()
    }
  }, [liquidityGraphDataLoaded, setLiquidityGraphData, setLiquidityGraphDataLoaded, setLiquidityLabelsData]);

  return useMemo(() => {
   return {
     data: liquidityGraphData,
     labels: liquidityLabelsData,
     loading: !liquidityGraphDataLoaded,
     lastDay: liquidityLabelsData[liquidityLabelsData?.length - 1]?.toLocaleString(locale, {year: "numeric", day: "numeric", month: "short"})
   }
  }, [liquidityGraphData, liquidityGraphDataLoaded, liquidityLabelsData, locale]);
}
