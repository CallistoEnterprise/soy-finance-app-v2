import { ChangeEvent, useMemo, useState } from "react";
import { useUserTokensStore } from "@/components/dialogs/stores/useImportTokenDialogStore";
import { useChainId, useReadContract } from "wagmi";
import { ERC20_ABI } from "@/config/abis/erc20";
import { Address, isAddress } from "viem";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Image from "next/image";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";
import addToast from "@/other/toast";
import SearchInput from "@/components/atoms/SearchInput";
import DialogHeader from "@/components/DialogHeader";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import { getExpLink } from "@/components/RecentTransaction";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";
import Svg from "@/components/atoms/Svg";
import Checkbox from "@/components/atoms/Checkbox";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";

export default function ImportTokenDialog({onImport, onBack, onClose}: {onImport: any, onBack: any, onClose: any}) {
  const [tokenAddressToImport, setTokenAddressToImport] = useState("");
  const chainId = useChainId();

  const [step, setStep] = useState<1 | 2>(1);

  const { addToken, userTokens, removeToken } = useUserTokensStore();

  const { data: tokenName, isFetched } = useReadContract({
    abi: ERC20_ABI,
    functionName: "name",
    chainId,
    address: tokenAddressToImport! as Address,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport)
    }
  });

  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport)
    }
  })

  const { data: tokenDecimals } = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport)
    }
  });

  const isActiveToken = useMemo(() => {
    return Boolean(Object.values(tokensInClo).map(t => t.address).includes(tokenAddressToImport as Address))
      || userTokens.map((t) => t.address).includes(tokenAddressToImport as Address)
  }, [tokenAddressToImport, userTokens])

  const [checked, setChecked] = useState(false);

  return <div className="w-[480px]">
    <DialogHeader title="Import token" handleClose={onClose} onBack={() => {
      if(step === 1) {
        onBack();
      } else {
        setStep(1);
      }
    }} />
    <div className="p-10 h-[551px]">
      {step === 1 &&
        <>
        <SearchInput large onChange={(e: ChangeEvent<HTMLInputElement>) => setTokenAddressToImport(e.target.value)} placeholder="Token address" />
      <div className="h-5" />
      {!isActiveToken && tokenName && tokenSymbol && tokenDecimals && <div className="border border-primary-border rounded-2 flex items-center py-2.5 px-5 justify-between">
        <div className="flex gap-2 items-center">
          <Image width={40} height={40} src="/images/all-tokens/placeholder.svg" alt="" />
          <div className="flex flex-col">
            <div>{tokenName}{" "}<span className="text-secondary-text">{tokenSymbol}</span></div>
            <div>{tokenDecimals} decimals</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a target="_blank" href={getExpLink(tokenAddressToImport, "token", chainId as AvailableChains)}><RoundedIconButton icon="arrow-popup" /></a>
          <PrimaryButton disabled={!tokenSymbol || !tokenName || !tokenDecimals || !isAddress(tokenAddressToImport) || isActiveToken}
                         onClick={() => setStep(2)}>Import</PrimaryButton>
          </div>
        </div>}


      {isActiveToken && <div className="flex justify-between">
        <span>{tokenName}</span>
        <p className="rounded-2 bg-green/20 text-green p-2">Active</p>
      </div>}

      {tokenAddressToImport && !isAddress(tokenAddressToImport) &&
        <div className="bg-orange/20 p-2 rounded-2 text-orange">
          Not valid token address
        </div>}

      {!tokenAddressToImport && <div className="h-[calc(100%-80px)] flex flex-col items-center justify-center">
        <EmptyStateIcon iconName="custom-tokens" />
        <h2 className="text-24 mt-2.5 text-center font-bold">Enter token address</h2>
        <p className="text-secondary-text text-center mt-1">To add a custom token, enter its address. Added tokens will be displayed in the Imported tab</p>
      </div>}

      {tokenAddressToImport && isAddress(tokenAddressToImport) && !tokenDecimals && <div className="h-[calc(100%-80px)] flex flex-col items-center justify-center">
        <EmptyStateIcon iconName="search" />
        <h2 className="text-24 mt-2.5 text-center font-bold">Token not found on current chain</h2>
        <p className="text-secondary-text text-center mt-1">Try change your search query,
          or switch to another Network</p>
      </div>}
        </>}
      {step === 2 && <div className="h-full">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="text-14 grid grid-cols-[24px_1fr] border border-orange bg-orange/10 rounded-2 px-5 py-4 gap-2.5">
              <Svg className="text-orange" iconName="warning" />

              <div>
                <p className="mb-2">Anyone can create a ERC223 token on Callisto Network with any name, including creating fake versions of existing tokens and tokens that claim to represent projects that do not have a token.</p>
                <p>If you purchase an arbitrary token, you may be unable to sell it back.</p>
              </div>
            </div>

            <div className="my-5 border border-primary-border rounded-2 flex items-center py-2.5 px-5 justify-between">
              <div className="flex gap-2 items-center">
                <Image width={40} height={40} src="/images/all-tokens/placeholder.svg" alt="" />
                <div className="flex flex-col">
                  <div>{tokenName}{" "}<span className="text-secondary-text">{tokenSymbol}</span></div>
                  <div>{tokenDecimals} decimals</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a target="_blank" href={getExpLink(tokenAddressToImport, "token", chainId as AvailableChains)}><RoundedIconButton icon="arrow-popup" /></a>
              </div>
            </div>
          </div>
          <div>
            <Checkbox checked={checked} handleChange={() => setChecked(!checked)} id="approve-import" label="I understand" />


            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <PrimaryButton variant="outlined" onClick={() => setStep(1)}>Cancel</PrimaryButton>
              <PrimaryButton
                disabled={!checked}
                onClick={() => {
                  addToken({
                    address: tokenAddressToImport as Address,
                    decimals: tokenDecimals!,
                    name: tokenName!,
                    symbol: tokenSymbol!,
                    chainId,
                    logoURI: "/images/all-tokens/placeholder.svg"
                  });
                  onImport();
                  addToast("Successfully imported!");
                }}>Import</PrimaryButton>
            </div>
          </div>
        </div>
      </div>}
    </div>
  </div>
}
