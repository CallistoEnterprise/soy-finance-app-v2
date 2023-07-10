import React, {useCallback} from "react";
import styles from "./TradeHistoryRows.module.scss";
import ExternalLink from "../../atoms/ExternalLink";
import Divider from "../../atoms/Divider";
import Button from "../../atoms/Button";
import clsx from "clsx";
import Svg from "../../atoms/Svg";
import tokenListInCLO from "../../../shared/constants/tokenLists/tokenlistInCLO.json";

export default function TradeHistoryRows({transactions, visibleItems, showMore, loading}) {
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

  if(loading) {
    return <React.Fragment>
      <div className={styles.tableHeader}>
        <div>Swap action</div>
        <div>Total</div>
        <div>Amount</div>
        <div>Amount</div>
        <div>Account</div>
        <div>Time</div>
      </div>
      <div className={styles.tableRows}>
        {[...Array(10)].map((item, index) => {
          return <React.Fragment key={index}>
            <div className={styles.tableRow}>
              <div  className={clsx(styles.mobileColumn, styles.actionCell)}>
                <span className={styles.internalLabel}>Swap action</span>
                <div className={styles.textPlaceholder} />
              </div>
              <div className={styles.mobileColumn}><span className={styles.internalLabel}>Total Value</span><div className={styles.textPlaceholder} /></div>
              <div className={styles.amount}><div className={styles.textPlaceholder} /></div>
              <div className={styles.amount}><div className={styles.textPlaceholder} /></div>
              <div className={clsx(styles.mobileColumn, styles.accountCell)}>
                <span className={styles.internalLabel}>Account</span>
                <div className={styles.textPlaceholder} />
              </div>
              <div className={clsx(styles.mobileColumn, styles.timeCell)}><span className={styles.internalLabel}>Time</span><div className={styles.textPlaceholder} /></div>
              <div className={styles.amountInternalWrapper}>
                <div><div className={styles.textPlaceholder} /></div>
                <Svg iconName="arrow-right" />
                <div><div className={styles.textPlaceholder} /></div>
              </div>
            </div>
            <div className={styles.divider}>
              {index !== visibleItems - 1 && <Divider/>}
            </div>
          </React.Fragment>
        })}
      </div>
    </React.Fragment>
  }

  return <React.Fragment>
    <div className={styles.tableHeader}>
      <div>Swap action</div>
      <div>Total</div>
      <div>Amount</div>
      <div>Amount</div>
      <div>Account</div>
      <div>Time</div>
    </div>
    <div className={styles.tableRows}>
      {transactions && transactions.slice(0, visibleItems).map((item, index) => {
        return <React.Fragment key={index}>
          <div className={styles.tableRow}>
            <div  className={clsx(styles.mobileColumn, styles.actionCell)}>
              <span className={styles.internalLabel}>Swap action</span>
              <ExternalLink
                href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
                text={`${getSymbol(item.token0Symbol, item.token0Address)} and ${getSymbol(item.token1Symbol, item.token1Address)}`}
              />
            </div>
            <div className={styles.mobileColumn}><span className={styles.internalLabel}>Total Value</span>${item.amountUSD.toFixed(2)}</div>
            <div className={styles.amount}>{item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}</div>
            <div className={styles.amount}>{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
            <div className={clsx(styles.mobileColumn, styles.accountCell)}>
              <span className={styles.internalLabel}>Account</span>
              <ExternalLink
                href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
                text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
              />
            </div>
            <div className={clsx(styles.mobileColumn, styles.timeCell)}><span className={styles.internalLabel}>Time</span>{(new Date(Date.now() - item.timestamp)).getMinutes()} min</div>
            <div className={styles.amountInternalWrapper}>
              <div>{item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}</div>
              <Svg iconName="arrow-right" />
              <div>{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
            </div>
          </div>
          <div className={styles.divider}>
            {index !== visibleItems - 1 && <Divider/>}
          </div>
        </React.Fragment>
      })}
    </div>
    {visibleItems < transactions?.length && (
      <div className={styles.buttonWrapper}>
        <Button onClick={showMore} variant="outlined">Show more</Button>
      </div>
    )}
  </React.Fragment>;
}
