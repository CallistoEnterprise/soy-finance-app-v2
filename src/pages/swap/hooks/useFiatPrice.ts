import {useEffect, useMemo, useState} from "react";
import {useEvent, useStore} from "effector-react";
import {setFiatPrices} from "../models";
import {$swapFiatPrices} from "../models/stores";

const APIChainsMap = {
  820: "clo",
  199: "bttc",
  61: "etc"
}

function serializeContractsData(contractsData): {[key: string]: number} {
  const result = {};

  for (const [key, value] of Object.entries(contractsData)) {
    result[key.toLowerCase()] = value.price.price;
  }
  return result;
}

export function useFiatPrice(address, chainId) {
  const [loading, setLoading] = useState(false);

  const setFiatPricesFn = useEvent(setFiatPrices);
  const fiatPrices = useStore($swapFiatPrices);

  useEffect(() => {
    if(!chainId) {
      return;
    }

    try {
      setLoading(true);
      (async () => {
        const contractsResponse = await fetch(`https://api-data.absolutewallet.com/api/v1/contracts/tokens?network=${APIChainsMap[chainId]}&fiat=USD&page=1&size=300`);
        const contractsData = await contractsResponse.json();

        const pricesObject = serializeContractsData(contractsData.data);

        setFiatPricesFn(pricesObject);
      })();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }

  }, [chainId, setFiatPricesFn]);

  return useMemo(() => {
    return {
      loading: !fiatPrices || loading || !address,
      price: fiatPrices?.[address?.toLowerCase()] || null
    }
  }, [fiatPrices, loading, address]);

}
