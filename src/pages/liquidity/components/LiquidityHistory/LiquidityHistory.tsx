import React, {useCallback, useEffect, useMemo, useState} from "react";
import {fetchTopTransactions, getUnixTime, startOfHour, sub, utcCurrentTime} from "../../../../shared/fetcher";
import PageCard from "../../../../components/atoms/PageCard";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import Button from "../../../../components/atoms/Button";
import styles from "../../../swap/components/TradeHistory/TradeHistory.module.scss";
import Divider from "../../../../components/atoms/Divider";
import tokenListInCLO from "../../../../shared/constants/tokenLists/tokenlistInCLO.json";
import Svg from "../../../../components/atoms/Svg/Svg";
import clsx from "clsx";
import ExternalLink from "../../../../components/atoms/ExternalLink";

const itemsPerPage = 10;

export default function LiquidityHistory() {
  const [data, setData] = useState<any>(null);
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const showMoreItems = () => {
    setVisibleItems(visibleItems + itemsPerPage);
  };

  const [selectedTab, setSelectedTab] = useState(0);


  const [visibleRemoveItems, setVisibleRemoveItems] = useState(itemsPerPage);
  const showMoreRemoveItems = () => {
    setVisibleRemoveItems(visibleRemoveItems + itemsPerPage);
  };

  useEffect(() => {
    const fetch = async () => {
      const d = await fetchTopTransactions();
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

    return data.filter(i => i.type === 1);
  }, [data]);

  const removeTransactions = useMemo(() => {
    if(!data) {
      return null;
    }

    return data.filter(i => i.type === 2);
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

    <div className={styles.tabs}>
      <button className={clsx(styles.tab, selectedTab === 0 && styles.activeTab)} onClick={() => {
        setSelectedTab(0);
      }}>Adds</button>
      <button className={clsx(styles.tab, selectedTab === 1 && styles.activeTab)} onClick={() => {
        setSelectedTab(1);
      }}>Removes</button>
    </div>


    {selectedTab === 0 && <React.Fragment>
      <div className={styles.tableHeader}>
        <div>Add action</div>
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
    </React.Fragment>}
    {selectedTab === 1 && <React.Fragment>
      <div className={styles.tableHeader}>
        <div>Remove action</div>
        <div>Total</div>
        <div>Amount</div>
        <div>Amount</div>
        <div>Account</div>
        <div>Time</div>
      </div>
      <div className={styles.tableRows}>
        {removeTransactions && removeTransactions.slice(0, visibleRemoveItems).map((item, index) => {
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
            {index !== visibleRemoveItems - 1 && <Divider/>}
          </React.Fragment>
        })}
      </div>
      {visibleRemoveItems < removeTransactions?.length && (
        <div className={styles.buttonWrapper}>
          <Button onClick={showMoreRemoveItems} variant="outlined">Show more</Button>
        </div>
      )}
    </React.Fragment>}
  </PageCard>;
}
