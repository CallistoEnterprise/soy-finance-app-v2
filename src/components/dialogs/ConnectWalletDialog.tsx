"use client";

import { useCallback } from "react";
import PickButton from "@/components/atoms/PickButton";
import { networks } from "@/config/networks";
import DialogHeader from "@/components/DialogHeader";
import MetamaskCard from "@/components/wallet-cards/MetamaskCard";
import WalletConnectCard from "@/components/wallet-cards/WalletConnectCard";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore
} from "@/components/dialogs/stores/useConnectWalletStore";
import addToast from "@/other/toast";
import { useConnect } from "wagmi";
import { config } from "@/config/wagmi/config";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

function StepLabel({step, label}: { step: string, label: string }) {
  return <div className="flex gap-2.5 items-center">
    <span className="w-10 h-10 text-18 rounded-full bg-secondary-bg flex items-center justify-center border border-primary-border">
      {step}
    </span>
    <span className="text-20 font-bold">{label}</span>
  </div>
}

export default function ConnectWalletDialog() {
  const { walletName, chainToConnect, setChainToConnect} = useConnectWalletStore();

  const { connectors, connectAsync } = useConnect({
    config
  });

  const {isOpened, setIsOpened} = useConnectWalletDialogStateStore()

  const handleConnect = useCallback(() => {

    if(walletName === "metamask") {
      connectAsync({
        connector: connectors[0],
        chainId: chainToConnect
      }).then(() => {
        setIsOpened(false);
        addToast("Successfully connected!")
      }).catch((e) => {
        if(e.code && e.code === 4001) {
          addToast("User rejected the request", "error");
        } else {
          addToast("Error: something went wrong", "error");
        }
      });
    }

    if(walletName === "wc") {
      connectAsync({
        connector: connectors[1],
        chainId: chainToConnect
      }).then(() => {
        setIsOpened(false);
        addToast("Successfully connected!")
      }).catch((e) => {
        if(e.code && e.code === 4001) {
          addToast("User rejected the request", "error");
        } else {
          addToast("Error: something went wrong", "error");
        }
      });
    }
  }, [chainToConnect, connectAsync, connectors, setIsOpened, walletName]);

  return <DrawerDialog isOpen={isOpened} setIsOpen={setIsOpened}>
    <div className="w-full xl:min-w-[500px]">
      <DialogHeader handleClose={() => setIsOpened(false)} title="Connect wallet" />
      <div className="p-10">
        <StepLabel step="1" label="Choose wallet" />
        <div className="grid grid-cols-3 gap-3 mt-3 mb-5">
          <MetamaskCard isLoading={false} />
          {/*<CoinbaseCard isLoading={false} />*/}
          <WalletConnectCard />
        </div>
        <StepLabel step="2" label="Choose network" />
        <div className="grid grid-cols-3 gap-3 mt-3 mb-5">
          {(walletName === "metamask" || walletName === "wc") && <>{networks.map(({name, chainId, logo}) => {
            return <PickButton key={chainId} isActive={chainId === chainToConnect} onClick={() => {
              setChainToConnect(chainId);
            }} image={logo} label={name} />
          })}</>}
        </div>
        <PrimaryButton fullWidth onClick={() => {
          handleConnect();
        }}>Connect wallet</PrimaryButton>
      </div>
    </div>
  </DrawerDialog>
}
