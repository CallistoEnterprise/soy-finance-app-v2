import {useMemo} from "react";
import {TokenAmount} from "@callisto-enterprise/soy-sdk";
import {parseUnits} from "ethers";
import JSBI from "jsbi";

export function useEnoughBalance({token, amount, balance}) {
    return useMemo(() => {
      if(!token || !balance || !amount || isNaN(amount)) {
        return false;
      }

      const amountParsed = parseUnits(amount, token.decimals).toString();

      const tokenAmount = new TokenAmount(token, JSBI.BigInt(amountParsed));
      return +balance >= tokenAmount.toSignificant();

    }, [token, amount, balance]);
}
