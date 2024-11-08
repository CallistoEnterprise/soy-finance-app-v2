import { useSwitchChain, useAccount } from "wagmi";
import { WrappedToken } from "@/config/types/WrappedToken";
import { useCallback, useEffect, useState } from "react";
import { launchpads } from "@/config/launchpad/launchpads";
import { Launchpad } from "@/config/types/launchpadTypes";
import Image from "next/image";
import addToast from "@/other/toast";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore,
} from "@/components/dialogs/stores/useConnectWalletStore";

interface Props {
  supportedChains: { [key: string]: WrappedToken };
  setChain: (chainId: number) => void;
}

type launchpadsObj = {
  [key: string]: Launchpad;
};

type chainsInOrderData = {
  chainData: WrappedToken;
  launchpads: number;
};

type chainID = 820 | 61 | 199;

function SelectChain({ supportedChains, setChain }: Props) {
  const { switchChainAsync } = useSwitchChain();
  const { isConnected, chainId } = useAccount();
  const { setIsOpened: setConnectOpened } = useConnectWalletDialogStateStore();
  const { setOpened: setSwitchOpened, setClose: setSwitchClose } =
    useAwaitingDialogStore();
  const { setChainToConnect } = useConnectWalletStore();
  const [chainsList, setChainsList] = useState<chainsInOrderData[]>([]);
  const [opacityState, setOpacityState] = useState("0");
  const [chainsAnimations, setChainsAnimations] = useState({});

  const chainCounter = useCallback((chainId: number) => {
    let counter = 0;
    let launchpadsList = launchpads as launchpadsObj;
    let launchpadsArray = Object.keys(launchpads);
    for (const launchpad of launchpadsArray) {
      const endTime = convertDateTimeStringToMilliseconds(
        launchpadsList[launchpad].endDate
      );
      if (launchpadsList[launchpad].chains[String(chainId)] && endTime) {
        if (Date.now() < endTime + 60 * 24 * 60 * 60 * 1000) {
          counter++;
        }
      }
    }
    return counter;
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setOpacityState("1");
      setTimeout(() => {
        setChainsAnimations({ margin: "20px 5%", opacity: "1" });
      }, 500);
    }, 200);
  }, []);

  useEffect(() => {
    if (supportedChains) {
      let chains = [];
      for (const chain of Object.keys(supportedChains)) {
        chains.push({
          chainData: supportedChains[chain],
          launchpads: chainCounter(supportedChains[chain].chainId),
        });
      }
      const sortedArray = chains
        .slice()
        .sort((a, b) => b.launchpads - a.launchpads);
      setChainsList(sortedArray);
    }
  }, [supportedChains, chainCounter]);

  const clickHandler = async (chainID: chainID) => {
    if (isConnected) {
      if (chainId !== chainID) {
        try {
          setSwitchOpened("Change network");
          const connected = await switchChainAsync({ chainId: chainID });
          if (connected) {
            setChain(chainID);
            setSwitchClose();
            addToast("Success!", "success");
          }
        } catch (err: any) {
          setSwitchClose();
          addToast("Something went wrong, please try again later.", "error");
        }
      } else {
        setChain(chainID);
      }
    } else {
      addToast("Please connect your wallet.", "error");
      setChainToConnect(chainID);
      setConnectOpened(true);
    }
  };

  const convertDateTimeStringToMilliseconds = (dateTimeString: string) => {
    if (dateTimeString) {
      const [dateString, timeString] = dateTimeString.split(" ");
      const [day, month, year] = dateString.split("/").map(Number);
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = Date.UTC(year, month - 1, day, hours, minutes);
      return date;
    }
  };

  const launchpadCounter = () => {
    let counter = 0;
    let launchpadsList = launchpads as launchpadsObj;
    let launchpadsArray = Object.keys(launchpads);
    for (const launchpad of launchpadsArray) {
      const endTime = convertDateTimeStringToMilliseconds(
        launchpadsList[launchpad].endDate
      );
      if (endTime && Date.now() < endTime + 60 * 24 * 60 * 60 * 1000) {
        counter++;
      }
    }
    return counter;
  };

  return (
    <div
      className="bg-primary-bg border-primary-border border rounded-5 launchpad-chain-selector"
      aria-labelledby=":r8e:"
      aria-describedby=":r8f:"
      id=":r8c:"
      role="dialog"
      style={{ width: "390px", opacity: opacityState }}
    >
      <div className="flex justify-between items-center py-3 pr-2 xl:pr-3 border-b border-primary-border pl-4 xl:pl-10">
        <h3 className="text-24 font-bold">Select a chain</h3>
      </div>
      <div className="simplebar-content" style={{ padding: "0px 20px" }}>
        {Object.keys(launchpads).length > 0 && launchpadCounter() ? (
          <ul className="mb-5 pt-5" style={chainsAnimations}>
            {chainsList.map((data) => (
              <div key={`${data.chainData.address}_${data.chainData.name}`}>
                {chainCounter(data.chainData.chainId) > 0 ? (
                  <li
                    className="flex items-center relative"
                    onClick={() =>
                      clickHandler(data.chainData.chainId as chainID)
                    }
                  >
                    <div className="relative w-full">
                      <button className="w-full h-[60px] group flex items-center justify-between pr-2.5 pl-2.5 rounded-2.5 hover:bg-secondary-bg">
                        <div className="flex items-center gap-2">
                          <Image
                            height={40}
                            width={40}
                            src={data.chainData.logoURI}
                            alt={
                              data.chainData.symbol
                                ? data.chainData.symbol
                                : "symbol"
                            }
                            style={{ marginRight: "5px" }}
                          />
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-16">
                              {data.chainData.name}
                              <span
                                className="text-12 text-secondary-text"
                                style={{ marginLeft: "3px" }}
                              >
                                {" "}
                                ({data.chainData.symbol})
                              </span>
                            </span>
                            <span className="text-12 text-green price">
                              {chainCounter(data.chainData.chainId)}{" "}
                              Launchpad(s)
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </li>
                ) : null}
              </div>
            ))}
          </ul>
        ) : (
          <p
            style={{ marginTop: "30px", textAlign: "center", fontSize: "17px" }}
          >
            No launchpad active.
          </p>
        )}
      </div>
    </div>
  );
}

export default SelectChain;
