import { SwitchChainNotSupportedError, useAccount, useChainId, useSwitchChain } from "wagmi";
import { useMemo, useState } from "react";
import { networks } from "@/config/networks";
import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/buttons/SelectButton";
import Image from "next/image";
import DropdownItem from "@/components/DropdownItem";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import addToast from "@/other/toast";
import {useTranslations} from "use-intl";

export default function ChangeNetworkMenu() {
  const t = useTranslations("Navigation");

  const [changeNetworkOpened, setChangeNetworkOpened] = useState(false);
  const {chainId} = useAccount();

  const currentNetwork = useMemo(() => {
    return networks.find((n) => n.chainId === chainId);
  }, [chainId]);


  const { switchChainAsync, switchChain, chains } = useSwitchChain();
  const {setOpened, setClose} = useAwaitingDialogStore();

  return <Popover isOpened={changeNetworkOpened} setIsOpened={setChangeNetworkOpened} placement="bottom-start"
                  trigger={
                    <SelectButton
                      onClick={() => setChangeNetworkOpened(!changeNetworkOpened)}
                      isOpened={changeNetworkOpened}
                    >
                      {currentNetwork
                        ? <div className="flex gap-2 items-center xl:w-auto overflow-hidden">
                            <Image className="flex-shrink-0" width={24} height={24} src={currentNetwork.logo} alt=""/>
                            <p className="overflow-ellipsis whitespace-nowrap overflow-hidden min-w-0">
                              {currentNetwork.name}
                            </p>
                        </div>
                        : t("unknown_network")}
                    </SelectButton>}>
    <div className="bg-primary-bg border border-primary-border rounded-2 py-1 z-[1000]">
      <ul className="flex flex-col gap-1">
        {networks.filter(n => {
          // display all networks for metamask
          // if(walletName === "metamask") {
          //   return true;
          // }

          return true;
          // return networks.includes(n.chainId);
        }).map(n => <li key={n.chainId}>
          <DropdownItem handleClick={async () => {

            if (switchChainAsync) {
              try {
                setOpened("Change network");
                await switchChainAsync({ chainId: n.chainId });
              } catch (e) {
                if(e instanceof SwitchChainNotSupportedError) {
                  addToast("Error while switching network: switchChain doesn't supported", "error");
                }
                console.log(e);
              } finally {
                setClose();
              }
            }
            setChangeNetworkOpened(false);
          }} label={n.name} image={n.logo} isActive={n.chainId === chainId}/>
        </li>)}
      </ul>
    </div>
  </Popover>
}
