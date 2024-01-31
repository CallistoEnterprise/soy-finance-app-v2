import ExternalLink from "@/components/atoms/ExternalLink";
import { RecentTransaction, RecentTransactionStatus } from "@/stores/useRecentTransactions";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";

const CHAINS_CONSTANTS = {
  820: {
    explorer: {
      name: 'CallistoScan',
      url: 'https://explorer.callisto.network',
    }
  },
  199: {
    explorer: {
      name: 'BttcScan',
      url: 'https://bttcscan.com/',
    },
  },
  61: {
    explorer: {
      name: 'ETCScan',
      url: 'https://blockscout.com/etc/mainnet/',
    }
  }
}
export function getExpLink(
  data: string | number,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainId: 820 | 199 | 61 = 820,
): string {
  switch (type) {
    case 'transaction': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/tx/${data}/token-transfers`
    }
    case 'token': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/address/${data}/transactions`
    }
    case 'block': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/${data}`
    }
    case 'countdown': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/${data}`
    }
    default: {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/address/${data}/transactions`
    }
  }
}
export default function RecentTransaction({transaction}: {transaction: RecentTransaction}) {
  return <div className="border-b border-primary-border h-11 flex justify-between items-center last-of-type:border-b-0 gap-4">
    <a href={getExpLink(transaction.hash, "transaction", [820, 199, 61].includes(transaction.chainId) ? transaction.chainId as 820 | 199 | 61 : 820)} target="_blank" className="cursor-pointer min-w-0 items-center gap-1 relative flex text-green after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full">
      <span className="whitespace-nowrap overflow-ellipsis overflow-hidden">{transaction.title}</span>
      <span className="flex-shrink-0"><Svg iconName="arrow-popup" /></span>
      {/*<ExternalLink href={getExpLink(transaction.hash, "transaction", [820, 199, 61].includes(transaction.chainId) ? transaction.chainId as 820 | 199 | 61 : 820)} text={transaction.title} />*/}
    </a>
    <div className="flex items-center gap-2.5">
      {transaction.status === RecentTransactionStatus.PENDING
        ? <Preloader size={20} />
        : transaction.status === RecentTransactionStatus.ERROR
          ? <Svg className="text-red" iconName="error" />
          : <Svg className="text-green" iconName="done" />}
    </div>
  </div>
}
