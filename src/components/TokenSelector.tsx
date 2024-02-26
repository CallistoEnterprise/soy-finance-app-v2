import { WrappedToken } from "@/config/types/WrappedToken";
import SmallOutlineTabButton from "@/components/buttons/SmallOutlineTabButton";
import Svg from "@/components/atoms/Svg";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { NumericFormat } from "react-number-format";
import { isNativeToken } from "@/other/isNativeToken";
import { useEffect, useMemo } from "react";
import useUSDPrices from "@/hooks/useUSDPrices";
import clsx from "clsx";
import { formatFloat } from "@/other/formatFloat";
import {useTranslations} from "use-intl";

function PercentageButtons({ value, balance, setAmount, decimals, isNativeToken = false }: {
  value: string,
  balance: any | undefined,
  setAmount: (value: string) => void,
  decimals: number | undefined,
  isNativeToken?: boolean
}) {
  if (!balance || !decimals) {
    return null;
  }


  return <div className="flex gap-2">
    {[25, 50, 75, 100].map((part) => {
      let valueToSet = balance * BigInt(part) / BigInt(100);
      if (isNativeToken) {
        valueToSet = valueToSet - parseUnits("1", decimals);
        if (valueToSet < BigInt(0)) {
          valueToSet = BigInt(0);
        }
      }
      const formattedValueToSet = formatUnits(valueToSet, decimals);

      return <SmallOutlineTabButton key={part} isActive={value === formattedValueToSet}
                                    onClick={() => setAmount(formattedValueToSet)}>{part === 100 ? "Max" : `${part}%`}</SmallOutlineTabButton>
    })}
  </div>
}

function InputWithTokenPick({ token, onPick, value, setAmount, pair, readonly = false, readonlyToken = false }: {
  token: WrappedToken | null,
  onPick: () => void,
  value: string,
  setAmount: (value: string) => void,
  pair?: [WrappedToken, WrappedToken] | [undefined, undefined],
  readonly?: boolean,
  readonlyToken?: boolean
}) {
  const t = useTranslations("PickTokenDialog");

  return <div className="relative w-full">
    <NumericFormat
      inputMode="decimal"
      placeholder="0.0"
      className={clsx(
        "w-full pr-[120px] pl-4 h-10 bg-primary-bg border border-primary-border text-primary-text rounded-2 outline-0 hover:border-green focus:border-green duration-200",
        readonly && "pointer-events-none")}
      type="text"
      value={value}
      onValueChange={(values) => {
        setAmount(values.value)
      }}
      readOnly={readonly}
    />
    <div className={clsx("absolute top-[1px]", (readonly || readonlyToken) ? "right-2.5" : "right-[1px]")}>
      <button onClick={onPick}
              className={clsx("h-[38px] px-2.5 bg-primary-bg flex justify-center items-center gap-1 rounded-2",
                (readonlyToken || readonly) && "pointer-events-none"
                )}>
        {pair ? <>
          {pair[0] && pair[1] ? <>
              <div className="relative left-2 flex">
                <span className="w-6 h-6 mr-1">
                  <img width={24} height={24} src={pair[0].logoURI} alt={pair[0].name}/>
                </span>
                <span className="relative w-6 h-6 mr-1 -left-2">
                  <img width={24} height={24} src={pair[1].logoURI} alt={pair[1].name}/>
                </span>
              </div>
              <div>
                <span className="text-16">{pair[0].symbol} {"-"} {pair[1].symbol}</span>
              </div>
            </>
            : <>
            <span className="w-6 h-6 mr-1">
              <Svg iconName="currency"/>
            </span>
              <p>Select token</p>
              <span className="w-6 h-6 mr-1">
              <Svg iconName="arrow-bottom"/>
            </span>
            </>}

        </> : <>
          {token
            ? <>
            <span className="w-6 h-6 mr-1">
              <img width={24} height={24} src={token.logoURI} alt={token.name}/>
            </span>

              <span className="text-16">{token.symbol}</span>
              {!readonly && !readonlyToken && <span className="w-6 h-6 text-primary-text">
            <Svg iconName="arrow-bottom"/>
          </span>}
            </>
            : <>
            <span className="w-6 h-6 mr-1">
              <Svg iconName="currency"/>
            </span>
              <span>{t("select_token")}</span>
              {!readonly && !readonlyToken && <span className="w-6 h-6 text-primary-text">
            <Svg iconName="arrow-bottom"/>
          </span>}
            </>
          }
        </>}
      </button>
    </div>
  </div>
}

interface Props {
  label: string,
  token: WrappedToken | null,
  onPick: () => void,
  amount: string,
  setAmount: (value: string) => void,
  pair?: [WrappedToken, WrappedToken] | [undefined, undefined],
  balance?: bigint,
  readonly?: boolean
  readonlyToken?: boolean
}

export default function TokenSelector({
                                        label,
                                        token,
                                        onPick,
                                        amount,
                                        setAmount,
                                        balance,
                                        pair,
                                        readonly = false,
                                        readonlyToken = false
                                      }: Props) {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data, refetch } = useBalance({
    address: token ? address : undefined,
    token: token
      ? isNativeToken(token?.address)
        ? undefined
        : token.address as `0x${string}`
      : undefined,
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  const _balance = useMemo(() => {
    if (!isConnected) {
      return BigInt(0);
    }

    if (balance != null) {
      return balance;
    }

    if (data && data.value) {
      return data.value
    }

    return BigInt(0);
  }, [balance, data, isConnected])

  const usdPrices = useUSDPrices();

  return <div className="p-4 xl:p-5 bg-secondary-bg rounded-2">
    <div className="flex justify-between items-center mb-2.5 h-6">
      <h3 className="text-14 font-bold">{label}</h3>
      {!readonly &&
        <PercentageButtons isNativeToken={isNativeToken(token?.address || "")} value={amount} balance={_balance}
                           setAmount={setAmount} decimals={token?.decimals}/>}
    </div>
    <InputWithTokenPick readonly={readonly} readonlyToken={readonlyToken} token={token} onPick={onPick} value={amount}
                        setAmount={setAmount} pair={pair}/>
    <div className="flex justify-between items-center mt-2 text-secondary-text text-12 min-h-[14px]">
      {isConnected && token &&
        <>
          <span>{amount && usdPrices && token && usdPrices[token.address] ? `~ $${formatFloat(+amount * usdPrices[token.address])}` : ""}</span>
          <span>Balance: {formatFloat(formatUnits(_balance, token.decimals))}</span>
        </>
      }
    </div>
  </div>
}
