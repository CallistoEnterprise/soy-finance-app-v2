import {useEvent, useStore} from "effector-react";
import {$soyPrice, setSoyPrice} from "./stores";
import { useEffect } from "react";
import {useTokenGraphData} from "../token-graph-data/useTokenGraphData";
import {Timeline} from "../token-graph-data/types";

export function useSoyPrice() {
  const price = useStore($soyPrice);
  const setSoyPriceFn = useEvent(setSoyPrice);
  const tokenGraphData = useTokenGraphData({address: "0x9fae2529863bd691b4a7171bdfcf33c7ebb10a65", timeline: Timeline.DAY});

  useEffect(() => {
    console.log(tokenGraphData);
    if(tokenGraphData && tokenGraphData.data) {
      setSoyPriceFn(tokenGraphData.data[tokenGraphData.data.length - 1]);
    }
  }, [setSoyPriceFn, tokenGraphData]);

  return {
    price,
    loading: !price
  }
}
