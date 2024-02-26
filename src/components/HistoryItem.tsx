import ExternalLink from "@/components/atoms/ExternalLink";
import Svg from "@/components/atoms/Svg";
import React, { useCallback } from "react";
import { Transaction } from "@/other/fetchRecentTransactions";
import { tokenListInCLO } from "@/config/token-lists/tokenListInCLO";
import { useMediaQuery } from "react-responsive";
import { useTranslations } from "use-intl";

interface Props {
  item: Transaction,
  index: number,
  visibleItems: number,
  loading: boolean
}

function getTimeElapsed(timestamp: string, minT: string, hoursT: string, daysT: string) {
  const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds
  const timeDifference = currentTime - +timestamp;
  const secondsPerMinute = 60;
  const secondsPerHour = 3600;
  const secondsPerDay = 86400;

  if (timeDifference < secondsPerHour) {
    // Less than an hour ago
    const minutes = Math.floor(timeDifference / secondsPerMinute);
    return `${minutes} ${minT}`;
  } else if (timeDifference < secondsPerDay) {
    // Between 1 hour and 24 hours ago
    const hours = Math.floor(timeDifference / secondsPerHour);
    return `${hours} ${hoursT}`;
  } else {
    // More than a day ago
    const days = Math.floor(timeDifference / secondsPerDay);
    return `${days} ${daysT}`;
  }
}

export default function HistoryItem({ item, index, visibleItems, loading }: Props) {
  const t = useTranslations("Swap");

  const getSymbol = useCallback((symbol: string, address: `0x${string}`) => {
    if (symbol !== "unknown") {
      return symbol;
    }

    const token = tokenListInCLO.find(t => t.address.toLowerCase() === address.toLowerCase());

    if (!token) {
      return "unknown";
    }
    return token.symbol;
  }, []);

  const isTablet = useMediaQuery({ query: '(min-width: 600px)' });
  const isLaptop = useMediaQuery({ query: '(min-width: 1024px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1366px)' });

  if (isDesktop) {

    return <>
      <div className="grid grid-cols-history p-5 text-primary-text">
      <div>
        <ExternalLink
          href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
          text={t("token_and_token", {tokenA: getSymbol(item.token0Symbol, item.token0Address), tokenB: getSymbol(item.token1Symbol, item.token1Address)})}
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
      <div>{getTimeElapsed(item.timestamp, t("min"), t("hours"), t("days"))}</div>
    </div>
    <div className="bg-primary-border w-full h-[1px]"/>
    </>
  }

  if(isLaptop) {
    return <div className="bg-secondary-bg pt-4 pb-5 px-5 rounded-2">
      <div className="flex flex-col gap-2.5 mb-2.5">
        <div className="flex justify-between items-center">
          <div>{t("swap_action")}</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
              text={t("token_and_token", {tokenA: getSymbol(item.token0Symbol, item.token0Address), tokenB: getSymbol(item.token1Symbol, item.token1Address)})}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>{t("account")}</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
              text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>{t("total_value")}</div>
          <div>${item.amountUSD.toFixed(2)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div>{t("time")}</div>
          <div>{getTimeElapsed(item.timestamp, t("min"), t("hours"), t("days"))}</div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2">
        {item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}
        <Svg iconName="arrow-right"/>
        <div className="text-end">{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
      </div>
    </div>
  }

  if (isTablet) {
    return <div className="bg-secondary-bg pt-4 pb-5 px-5 rounded-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div>{t("swap_action")}</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
              text={t("token_and_token", {tokenA: getSymbol(item.token0Symbol, item.token0Address), tokenB: getSymbol(item.token1Symbol, item.token1Address)})}
            />
          </div>
        </div>
        <div>
          <div>{t("account")}</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
              text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
            />
          </div>
        </div>
        <div>
          <div>{t("total_value")}</div>
          <div>${item.amountUSD.toFixed(2)}</div>
        </div>
        <div>
          <div>{t("time")}</div>
          <div>{getTimeElapsed(item.timestamp, t("min"), t("hours"), t("days"))}</div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2">
        {item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}
        <Svg iconName="arrow-right"/>
        <div className="text-end">{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
      </div>
    </div>
  }

  return <div className="bg-secondary-bg pt-4 pb-5 px-5 rounded-2">
    <div className="flex flex-col gap-2.5 mb-2.5">
      <div className="flex justify-between items-center">
        <div>{t("swap_action")}</div>
        <div>
          <ExternalLink
            href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
            text={t("token_and_token", {tokenA: getSymbol(item.token0Symbol, item.token0Address), tokenB: getSymbol(item.token1Symbol, item.token1Address)})}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>{t("account")}</div>
        <div>
          <ExternalLink
            href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
            text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>{t("total_value")}</div>
        <div>${item.amountUSD.toFixed(2)}</div>
      </div>
      <div className="flex justify-between items-center">
        <div>{t("time")}</div>
        <div>{getTimeElapsed(item.timestamp, t("min"), t("hours"), t("days"))}</div>
      </div>
    </div>
    <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2 text-14">
      {item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}
      <Svg iconName="arrow-right"/>
      <div className="text-end">{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
    </div>
  </div>
}
