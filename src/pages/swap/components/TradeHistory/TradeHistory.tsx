import React, {useCallback, useEffect, useMemo, useState} from "react";
import styles from "./TradeHistory.module.scss";
import Button from "../../../../components/atoms/Button";
import Divider from "../../../../components/atoms/Divider";
import PageCard from "../../../../components/atoms/PageCard";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import {fetchTopSwapTransactions} from "../../../../shared/fetcher";
import tokenListInCLO from "../../../../shared/constants/tokenLists/tokenlistInCLO.json";
import ExternalLink from "../../../../components/atoms/ExternalLink";

const itemsPerPage = 10;

export default function TradeHistory() {
  const [data, setData] = useState<any>(null);
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const showMoreItems = () => {
    setVisibleItems(visibleItems + itemsPerPage);
  };

  useEffect(() => {
    const fetch = async () => {
      console.log("FETCHING");
      const d = await fetchTopSwapTransactions();
      console.log(d);
      if (d) {
        setData(d)
      }
    }
    if (!data) {
      fetch()
    }
  }, [data]);

  // console.log(data);

  const addTransactions = useMemo(() => {
    if(!data) {
      return null;
    }

    return data.filter(i => i.type === 0);
  }, [data]);


  // console.log(addTransactions);
  // console.log(removeTransactions);

  const getSymbol = useCallback((symbol, address) => {
    if (symbol !== "unknown") {
      return symbol;
    }

    const token = tokenListInCLO.tokens.find(t => t.address.toLowerCase() === address.toLowerCase());

    if (!token) {
      return "unknown";
    }
    return token.symbol;
  }, []);

  return <PageCard>
    <PageCardHeading title="Trade history"/>

    <React.Fragment>
      <div className={styles.tableHeader}>
        <div>Swap action</div>
        <div>Total</div>
        <div>Amount</div>
        <div>Amount</div>
        <div>Account</div>
        <div>Time</div>
      </div>
      <div className={styles.tableRows}>
        {addTransactions && addTransactions.slice(0, visibleItems).map((item, index) => {
          return <React.Fragment key={index}>
            <div className={styles.tableRow}>
              <div>
                <ExternalLink
                  href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
                  text={`${getSymbol(item.token0Symbol, item.token0Address)} and ${getSymbol(item.token1Symbol, item.token1Address)}`}
                />
              </div>
              <div>${item.amountUSD.toFixed(2)}</div>
              <div>{item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}</div>
              <div>{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
              <div>
                <ExternalLink
                  href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
                  text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
                />
              </div>
              <div>{(new Date(Date.now() - item.timestamp)).getMinutes()} min</div>
            </div>
            {index !== visibleItems - 1 && <Divider/>}
          </React.Fragment>
        })}
      </div>
      {visibleItems < addTransactions?.length && (
        <div className={styles.buttonWrapper}>
          <Button onClick={showMoreItems} variant="outlined">Show more</Button>
        </div>
      )}
    </React.Fragment>
  </PageCard>;
}
