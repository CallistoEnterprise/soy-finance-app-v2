import { useEffect } from "react";
import { fetchChartData, getOverviewChartData } from "@/other/fetchRecentTransactions";
import { useLiquidityGraphStore } from "@/app/[locale]/liquidity/stores/useLiquidityGraphDataStore";

export function useLiquidityGraphData() {
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

  return {
    data: liquidityGraphData,
    labels: liquidityLabelsData,
    loading: !liquidityGraphDataLoaded
  }
}
