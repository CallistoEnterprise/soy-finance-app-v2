import DialogHeader from "@/components/DialogHeader";
import React, { useMemo } from "react";
import ExternalLink from "@/components/atoms/ExternalLink";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Svg from "@/components/atoms/Svg";
import CopyArea from "@/components/CopyArea";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import useZustandStore from "@/stores/useZustandStore";
import RecentTransaction from "@/components/RecentTransaction";
import { useWalletDialogStore } from "@/components/dialogs/stores/useWalletDialogStore";
import clsx from "clsx";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import SimpleBar from "simplebar-react";
import { tokensInClo, wclo } from "@/config/token-lists/tokenListInCLO";
import { formatUnits } from "viem";
import { availableChainIds } from "@/config/networks";
import { tokensInEtc } from "@/config/token-lists/tokenlistInETC";
import { tokensInBtt } from "@/config/token-lists/tokenlistInBTT";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import { formatFloat } from "@/other/formatFloat";
import { useTranslations } from "use-intl";

function InfoRow({ label, value }: { label: any, value: any }) {
  return <div className="text-14 leading-[18px] flex justify-between items-center text-secondary-text">
    <span>{label}</span>
    <span className="text-primary-text">{value}</span>
  </div>
}

export default function WalletDialog() {
  const t = useTranslations("SettingsAndWallet");

  const { address, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  const transactions = useZustandStore(useRecentTransactionsStore, state => {
    if (address) {
      return state.transactions[address];
    }
    return [];
  });

  const { clearTransactions } = useRecentTransactionsStore();

  const { isOpen, setIsOpen, activeTab, setActiveTab } = useWalletDialogStore();



  const coin = useMemo(() => {
    if(!chainId || !nativeTokens[chainId]) {
      return nativeTokens[820]
    }

    return nativeTokens[chainId]
  }, [chainId]);

  const tokens = useMemo(() => {
    if(!chainId || !availableChainIds.includes(chainId)) {
      return tokensInClo;
    }

    if(chainId === 61) {
      return tokensInEtc;
    }

    if(chainId === 199) {
      return tokensInBtt;
    }

    return tokensInClo;

  }, [chainId]);


  const coinBalance = useBalance({
    address: address,
    token: undefined
  });

  const soyBalance = useBalance({
    address: address,
    token: tokens.soy.address
  });

  return <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <div className="w-full sm:w-[480px]">
      <DialogHeader title={t("your_wallet")} handleClose={() => setIsOpen(false)}/>

      <div className="p-4 pb-10 md:p-10">
        <div className="flex gap-2.5 mb-5">
          <button className={clsx(
            "border w-full rounded-2 text-16 h-10 border-green duration-200",
            activeTab === 0 ? "bg-green text-white" : "bg-transparent text-primary-text"
          )} onClick={() => setActiveTab(0)}>{t("wallet")}</button>
          <button className={clsx(
            "border w-full rounded-2 text-16 h-10 border-green duration-200",
            activeTab === 1 ? "bg-green text-white" : "bg-transparent text-primary-text"
          )} onClick={() => setActiveTab(1)}>{t("transactions")}</button>
        </div>
        {activeTab === 0 && <div className="h-[290px] xl:h-276">
          <h3 className="font-medium text-primary-text text-16">{t("your_address")}</h3>
          <div style={{ marginTop: 8, marginBottom: 10 }}>
            <CopyArea text={address as string}/>
          </div>
          <div className="border border-primary-border rounded-2 p-4 flex justify-center flex-col gap-2.5">
            <InfoRow label={t("balance", {symbol: coin.symbol})} value={coinBalance.data ? formatFloat(formatUnits(coinBalance.data.value, 18)) : "Loading..."}/>
            <InfoRow label={t("balance", {symbol: "SOY"})} value={soyBalance.data ? formatFloat(formatUnits(soyBalance.data.value, 18)) : "Loading..."}/>
          </div>
          <div className="my-5">
            <ExternalLink href={`https://explorer.callisto.network/address/${address}/transactions`}
                          text={t("view_on_explorer", {explorerName: "CallistoScan"})}/>
          </div>
          <PrimaryButton onClick={() => {
            disconnect();
            setIsOpen(false);
          }} fullWidth variant="outlined">
            {t("disconnect")}
            <span><Svg iconName="logout"/></span>
          </PrimaryButton>
        </div>}
        {activeTab === 1 && <div className="h-[290px] xl:h-276 relative">
          {transactions?.length
            ? <>
              <div className="h-[290px] xl:h-276">
                <SimpleBar className="my-0 md:-mx-5 py-0 md:px-5 -mx-4 px-4" style={{ maxHeight: 277 }}>
                {transactions?.map((transaction) => {
                  return <RecentTransaction key={transaction.hash} transaction={transaction}/>
                })}
                </SimpleBar>
              </div>
            </>
            : <div className="flex">
              <div>
                {/*<Image src="/images/no-recent.svg" alt="" width={80} height={80}/>*/}
              </div>
              {t("displayed_here")}
            </div>}
          <div className="absolute -bottom-[40px] left-0 right-0 sm:-left-[1px] sm:-right-[1px] h-[50px] flex justify-between items-center bg-primary-bg -ml-4 md:-ml-10 -mr-4 md:-mr-10 sm:rounded-b-5 px-4 md:px-10 z-50 sm:border-x border-t border-primary-border">
              {t("total_transactions")}: {transactions?.length || 0}

              <button onClick={clearTransactions} disabled={!transactions?.length}
                      className="text-red flex gap-1 items-center disabled:opacity-50 disabled:pointer-events-none">
                <Svg iconName="delete" />
                {t("clear_all")}
              </button>
          </div>
        </div>}
      </div>
    </div>
  </DrawerDialog>
}
