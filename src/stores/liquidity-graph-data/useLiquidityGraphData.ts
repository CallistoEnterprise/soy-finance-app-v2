import {useEffect} from "react";
import {fetchChartData, getOverviewChartData} from "../../shared/fetcher";
import {useEvent, useStore} from "effector-react";
import {
  $liquidityGraphData,
  $liquidityGraphDataLoaded, $liquidityLabelsData,
  setLiquidityGraphData,
  setLiquidityGraphDataLoaded, setLiquidityLabelsData
} from "./stores";


export function useLiquidityGraphData() {
  const data = useStore($liquidityGraphData);
  const labels = useStore($liquidityLabelsData);
  const loaded = useStore($liquidityGraphDataLoaded);

  const setLiquidityGraphDataFn = useEvent(setLiquidityGraphData);
  const setLiquidityGraphDataLoadedFn = useEvent(setLiquidityGraphDataLoaded);
  const setLiquidityLabelsDataFn = useEvent(setLiquidityLabelsData);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await fetchChartData(getOverviewChartData)
      if (data) {
        const dataResult = [];
        const labelsResult = [];

        for(const item of data) {
          dataResult.push(item.liquidityUSD);
          labelsResult.push(new Date(item.date * 1000));
        }

        setLiquidityGraphDataFn(dataResult);
        setLiquidityLabelsDataFn(labelsResult);
      }
      setLiquidityGraphDataLoadedFn();
    }
    if (!loaded) {
      fetch()
    }
  }, [loaded, setLiquidityGraphDataFn, setLiquidityGraphDataLoadedFn, setLiquidityLabelsDataFn]);

  return {
    data,
    labels,
    loading: !loaded
  }
}
