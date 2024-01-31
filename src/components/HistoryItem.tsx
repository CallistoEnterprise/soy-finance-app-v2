import ExternalLink from "@/components/atoms/ExternalLink";
import Svg from "@/components/atoms/Svg";
import React, { useCallback } from "react";
import { Transaction } from "@/other/fetchRecentTransactions";
import { tokenListInCLO } from "@/config/token-lists/tokenListInCLO";
import { useMediaQuery } from "react-responsive";
import Skeleton from "@/components/atoms/Skeleton";

interface Props {
  item: Transaction,
  index: number,
  visibleItems: number,
  loading: boolean
}

function getTimeElapsed(timestamp: string) {
  const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds
  const timeDifference = currentTime - +timestamp;
  const secondsPerMinute = 60;
  const secondsPerHour = 3600;
  const secondsPerDay = 86400;

  if (timeDifference < secondsPerHour) {
    // Less than an hour ago
    const minutes = Math.floor(timeDifference / secondsPerMinute);
    return `${minutes} min`;
  } else if (timeDifference < secondsPerDay) {
    // Between 1 hour and 24 hours ago
    const hours = Math.floor(timeDifference / secondsPerHour);
    return `${hours} hours`;
  } else {
    // More than a day ago
    const days = Math.floor(timeDifference / secondsPerDay);
    return `${days} days`;
  }
}

export default function HistoryItem({ item, index, visibleItems, loading }: Props) {
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
      <div>{getTimeElapsed(item.timestamp)}</div>
    </div>
    <div className="bg-primary-border w-full h-[1px]"/>
    </>
  }

  if(isLaptop) {
    return <div className="bg-secondary-bg pt-4 pb-5 px-5 rounded-2">
      <div className="flex flex-col gap-2.5 mb-2.5">
        <div className="flex justify-between items-center">
          <div>Swap action</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
              text={`${getSymbol(item.token0Symbol, item.token0Address)} and ${getSymbol(item.token1Symbol, item.token1Address)}`}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Account</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
              text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Total value</div>
          <div>${item.amountUSD.toFixed(2)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div>Time</div>
          <div>{getTimeElapsed(item.timestamp)}</div>
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
          <div>Swap action</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
              text={`${getSymbol(item.token0Symbol, item.token0Address)} and ${getSymbol(item.token1Symbol, item.token1Address)}`}
            />
          </div>
        </div>
        <div>
          <div>Account</div>
          <div>
            <ExternalLink
              href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
              text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
            />
          </div>
        </div>
        <div>
          <div>Total value</div>
          <div>${item.amountUSD.toFixed(2)}</div>
        </div>
        <div>
          <div>Time</div>
          <div>{getTimeElapsed(item.timestamp)}</div>
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
        <div>Swap action</div>
        <div>
          <ExternalLink
            href={`https://explorer.callisto.network/tx/${item.hash}/token-transfers`}
            text={`${getSymbol(item.token0Symbol, item.token0Address)} and ${getSymbol(item.token1Symbol, item.token1Address)}`}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>Account</div>
        <div>
          <ExternalLink
            href={`https://explorer.callisto.network/address/${item.sender}/transactions`}
            text={`${item.sender.slice(0, 4)}...${item.sender.slice(-4)}`}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>Total value</div>
        <div>${item.amountUSD.toFixed(2)}</div>
      </div>
      <div className="flex justify-between items-center">
        <div>Time</div>
        <div>{getTimeElapsed(item.timestamp)}</div>
      </div>
    </div>
    <div className="grid grid-cols-[1fr_24px_1fr] px-5 py-2 bg-primary-bg rounded-2 text-14">
      {item.amountToken0.toFixed(2)} {getSymbol(item.token0Symbol, item.token0Address)}
      <Svg iconName="arrow-right"/>
      <div className="text-end">{item.amountToken1.toFixed(2)} {getSymbol(item.token1Symbol, item.token1Address)}</div>
    </div>
  </div>
}
