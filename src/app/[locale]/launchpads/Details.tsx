import { useEffect, useState, useCallback } from "react";
import PageCard from "@/components/PageCard";
import Image from "next/image";
import { Launchpad, ChainDetails } from "@/config/types/launchpadTypes";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import { formatFloat } from "@/other/formatFloat";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Svg from "@/components/atoms/Svg";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import nameSVG from "@/../public/images/launchpad-details/Name.svg";
import symbolSVG from "@/../public/images/launchpad-details/Symbol.svg";
import totalSupplySVG from "@/../public/images/launchpad-details/Total-Supply.svg";
import decimalsSVG from "@/../public/images/launchpad-details/Decimal.svg";
import tokenAddressSVG from "@/../public/images/launchpad-details/Token-Address.svg";
import startICOSVG from "@/../public/images/launchpad-details/ICO-Start.svg";
import endICOSVG from "@/../public/images/launchpad-details/ICO-End.svg";
import rateSVG from "@/../public/images/launchpad-details/rate.svg";
import tokensPresaleSVG from "@/../public/images/launchpad-details/Token-Presale.svg";
import softCapSVG from "@/../public/images/launchpad-details/Softcap.svg";
import hardCapSVG from "@/../public/images/launchpad-details/Hardcap.svg";
import ICOAddressSVG from "@/../public/images/launchpad-details/ICO-Address.svg";
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useReadContract,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { Address, formatUnits, Abi, parseUnits } from "viem";
import { isNativeToken } from "@/other/isNativeToken";
import { ICOcontract_ABI } from "@/config/abis/IcoContract";
import addToast from "@/other/toast";
import { vestingContractABI } from "@/config/abis/vestingContract";
import { SLOTH_VESTING_ABI } from "@/config/abis/slothVesting";
import useAllowance from "@/hooks/useAllowance";
import { WrappedToken } from "@/config/types/WrappedToken";

type LaunchpadData = {
  launchpad: Launchpad;
  name: string;
  symbol: string;
  decimals: number;
};

type currentCurrencyData = {
  token: WrappedToken;
  price: number;
};

type currenciesList = {
  useNativeAsPayment: boolean;
  nativePrice: number;
  tokens: currentCurrencyData[];
};

interface Props {
  children: LaunchpadData;
  onClick: () => void;
}

function Details({ children, onClick }: Props) {
  // launchpad main vars
  const [launchpad, setLaunchpad] = useState<Launchpad>(children.launchpad);
  const [timer, setTimer] = useState("Loading...");
  const [dialogue, setDialogue] = useState("Starts in");
  const [inputValue, setInputValue] = useState("");
  const [calculatedValue, setCalculatedValue] = useState("1");
  const [getlabelState, setLabelState] = useState("Loading");
  const [dialogOpened, setDialogOpened] = useState(false);
  // Vars that scales if the user changed his chain
  const [currentCurrency, setCurrentCurrency] = useState<WrappedToken>();
  const [price, setPrice] = useState(0);
  const [currentChainID, setCurrentChainID] = useState(0);
  const [tokenValues, setTokenValues] = useState<currentCurrencyData[]>([]);
  const [currentChain, setCurrentChain] = useState<ChainDetails>({
    tokenAddress: `0x${""}`,
    icoContract: `0x${""}`,
    vestingContract: `0x${""}`,
    currencies: { nativePrice: 0, useNativeAsPayment: true, tokens: [{}] },
  });
  // Infos (token/ICO/vesting)
  const [tokenInfo, setTokenInfo] = useState({
    name: children.name,
    symbol: children.symbol,
    decimals: children.decimals,
  });
  const [ICOInfo, setICOInfo] = useState({
    amount: BigInt(0),
    roundStarts: BigInt(0),
    totalSold: BigInt(0),
  });

  const [mediasFound, setMedias] = useState("");
  const [progress, setProgress] = useState(0);
  // if the launchpads list are not loaded

  // Gets the infos on the current chain from nativeTokens obj (symbol, chainID, decimals...)
  let firstSupportedChainIndex = launchpad
    ? Object.keys(launchpad.chains).length - 1
    : 0;
  let firstSupportedChainID = launchpad
    ? Object.keys(launchpad.chains)[firstSupportedChainIndex]
    : 0;
  let firstSupportedChain = launchpad
    ? launchpad.chains[firstSupportedChainID]
    : null;
  let [chainInfo, setChainInfo] = useState(
    nativeTokens[Number(firstSupportedChainID)]
  );
  // funcs
  const { addTransaction } = useRecentTransactionsStore();
  const { setOpened: setSwitchOpened, setClose: setSwitchClose } =
    useAwaitingDialogStore();
  const { setOpened, setClose, setSubmitted } = useAwaitingDialogStore();
  const publicClient = usePublicClient();
  const { address, isConnected, chainId } = useAccount();
  const { setIsOpened } = useConnectWalletDialogStateStore();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const { data: ICOinfoData } = useReadContract({
    abi: ICOcontract_ABI,
    address: currentChain.icoContract,
    functionName: "getCurrentRound",
  });

  const { data: VestingData } = useReadContract({
    abi: vestingContractABI,
    functionName: "getUnlockedAmount",
    address: currentChain.vestingContract,
    args: [address!],
    query: {
      enabled: Boolean(address),
    },
  });

  const getExplorerTokenLink = () => {
    switch (currentChainID) {
      case 199:
        return "https://bttcscan.com/token/";
      case 820:
        return "https://explorer.callisto.network/tokens/";
      case 61:
        return "https://etc.blockscout.com/token/";
    }
  };

  const getExplorerContractLink = () => {
    switch (currentChainID) {
      case 199:
        return "https://bttcscan.com/address/";
      case 820:
        return "https://explorer.callisto.network/address/";
      case 61:
        return "https://etc.blockscout.com/address/";
    }
  };

  // links
  const explorerContract = getExplorerContractLink();
  const explorerToken = getExplorerTokenLink();

  // Define all the infos
  const {
    chains,
    logo,
    description,
    supply,
    softCap,
    hardCap,
    endDate,
    website,
    twitter,
    telegram,
    saleType,
  } = launchpad;

  const { name, symbol, decimals } = tokenInfo;

  const {
    roundStarts: startDate,
    amount: tokensForSale,
    totalSold: currentSupply,
  } = ICOInfo;

  const formatedtokensForSale = Number(
    formatFloat(formatUnits(tokensForSale, decimals)) || 0
  );
  const formatedCurrentSupply = Number(
    formatFloat(formatUnits(currentSupply, decimals)) || 0
  );

  const [unlockedAmount, setUnlockedAmount] = useState(BigInt(0));
  const [lockedAmount, setLockedAmount] = useState(BigInt(0));
  const [nextUnlock, setNextUnlock] = useState(BigInt(0));

  // Convert the time to ms
  const convertDateTimeStringToMilliseconds = (dateTimeString: string) => {
    const [dateString, timeString] = dateTimeString.split(" ");
    const [day, month, year] = dateString.split("/").map(Number);
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = Date.UTC(year, month - 1, day, hours, minutes);
    return date;
  };

  // Convert time to readable format
  const startDateFormat = new Date(Number(startDate) * 1000);
  const endDateFormat = new Date(
    Number(convertDateTimeStringToMilliseconds(endDate))
  );

  const { data: balanceValue, refetch } = useBalance({
    address: currentCurrency ? address : undefined,
    token: currentCurrency
      ? isNativeToken(currentCurrency.address)
        ? undefined
        : (currentCurrency.address as `0x${string}`)
      : undefined,
    chainId,
  });

  const { isAllowed, writeTokenApprove } = useAllowance({
    contractAddress: currentChain.icoContract
      ? currentChain.icoContract
      : undefined,
    amountToCheck: currentCurrency?.decimals
      ? parseUnits(inputValue, currentCurrency.decimals)
      : parseUnits(inputValue, 18),
    token: currentCurrency ? currentCurrency : null,
  });

  useEffect(() => {
    if (ICOinfoData) {
      let info = ICOinfoData as {
        roundStarts: bigint;
        amount: bigint;
        totalSold: bigint;
      };
      setICOInfo(info);
    }
    if (VestingData) {
      const vesting = VestingData as bigint[];
      setUnlockedAmount(vesting[0]);
      setLockedAmount(vesting[1]);
      setNextUnlock(vesting[2]);
    }
  }, [ICOinfoData, VestingData]);

  // used to locate the launchpad in the list of launchpads
  useEffect(() => {
    if (price !== 0) {
      // Calculate how many tokens are worth 1 coin
      setCalculatedValue(String(Number(inputValue) * Number(price)));
    }
  }, [price]);

  useEffect(() => {
    if (launchpad) {
      // Detect if the medias values are present
      const { website, twitter, telegram } = launchpad;
      if (website || twitter || telegram) {
        setMedias("");
      } else {
        setMedias("ICO-launchpad-no-media");
      }
    }
  }, [launchpad, ICOInfo]);

  useEffect(() => {
    // Updates the timer and defines the state of the sale
    const timerUpdater = (startTime: number, endTime: number) => () => {
      let current = Date.now();
      let timerInMs = startTime - current;
      if (timerInMs < 0 && dialogue !== "Ended") {
        timerInMs = endTime - current;
        setDialogue("Ends in");
        setLabelState("Live");
      } else if (timerInMs > 0) {
        setLabelState("Soon");
      }
      let days = String(Math.floor(timerInMs / (1000 * 60 * 60 * 24))).padStart(
        2,
        "0"
      );
      let hours = String(
        Math.floor((timerInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      ).padStart(2, "0");
      let minutes = String(
        Math.floor((timerInMs % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      if (current <= endTime) {
        if (Number(days) > 0) {
          setTimer(`${days} Day(s) and ${hours} Hour(s)`);
        } else if (Number(days) == 0 && Number(hours) > 0) {
          setTimer(`${hours} Hour(s) and ${minutes} Minute(s)`);
        } else if (Number(days) == 0 && Number(hours) == 0) {
          setTimer(`${minutes} Minute(s)`);
        }
      } else {
        setTimer("");
        setDialogue("Ended");
        setLabelState("Ended");
      }
      if (formatedCurrentSupply === formatedtokensForSale) {
        setTimer("");
        setDialogue("Ended");
        setLabelState("Ended");
      }
    };
    if (endDate) {
      // Add startDate
      setTimeout(
        timerUpdater(
          Number(startDate),
          Number(convertDateTimeStringToMilliseconds(endDate))
        ),
        100
      );
      const timerInterval = setInterval(
        timerUpdater(
          Number(startDate),
          Number(convertDateTimeStringToMilliseconds(endDate))
        ),
        60000
      );
      return () => clearInterval(timerInterval);
    }
  }, [
    startDate,
    endDate,
    dialogue,
    formatedCurrentSupply,
    formatedtokensForSale,
  ]);

  // if the chainId has been changed and its not the required one then set the inputs to 0
  useEffect(() => {
    if (launchpad && chains && chainId) {
      setCurrentChainID(Number(chainId));
      let currentChainFromList = undefined;
      Object.keys(chains).forEach((chain) => {
        if (Number(chain) === chainId) {
          setCurrentChain(chains[chainId]);
          setChainInfo(nativeTokens[chainId]);
          currentChainFromList = chains[chainId];
        }
      });
      if (currentChainFromList) {
        let chainInfo = nativeTokens[chainId];
        setCurrentChain(currentChainFromList);
        setInputValue("1");
        const { currencies } = currentChainFromList;
        const { useNativeAsPayment, tokens, nativePrice } =
          currencies as currenciesList;
        if (useNativeAsPayment && chainInfo.symbol) {
          setCurrentCurrency({
            symbol: chainInfo.symbol,
            address: chainInfo.address,
            logoURI: chainInfo.logoURI,
            chainId: chainInfo.chainId,
            decimals: chainInfo.decimals,
            sortsBefore(other) {
              return false;
            },
            equals(other) {
              return false;
            },
          });
          setPrice(nativePrice);
          setCalculatedValue(String(nativePrice));
        } else {
          setCurrentCurrency({
            symbol: tokens[0].token.symbol,
            address: tokens[0].token.address,
            logoURI: tokens[0].token.logoURI,
            chainId: chainInfo.chainId,
            decimals: tokens[0].token.decimals,
            sortsBefore(other) {
              return false;
            },
            equals(other) {
              return false;
            },
          });
          setPrice(tokens[0].price);
          setCalculatedValue(String(tokens[0].price));
        }
        setTokenValues([...tokens]);
      } else if (firstSupportedChain) {
        let chainInfo = nativeTokens[firstSupportedChainID];
        setCurrentChainID(Number(firstSupportedChainID));
        setCurrentChain(firstSupportedChain);
        setInputValue("0");
        setCalculatedValue("0");
        setTokenValues([]);
        if (
          firstSupportedChain.currencies.useNativeAsPayment &&
          chainInfo.symbol
        ) {
          const { tokens } = firstSupportedChain.currencies as currenciesList;
          setCurrentCurrency({
            symbol: chainInfo.symbol,
            address: chainInfo.address,
            logoURI: chainInfo.logoURI,
            chainId: chainInfo.chainId,
            decimals: chainInfo.decimals,
            sortsBefore(other) {
              return false;
            },
            equals(other) {
              return false;
            },
          });
          setPrice(tokens[0].price);
        } else if (!firstSupportedChain.currencies.useNativeAsPayment) {
          const { tokens } = firstSupportedChain.currencies as currenciesList;
          setCurrentCurrency({
            symbol: tokens[0].token.symbol,
            address: tokens[0].token.address,
            logoURI: tokens[0].token.logoURI,
            chainId: chainInfo.chainId,
            decimals: tokens[0].token.decimals,
            sortsBefore(other) {
              return false;
            },
            equals(other) {
              return false;
            },
          });
          setPrice(tokens[0].price);
        } else {
          setCurrentCurrency({
            symbol: "undef",
            address: "0xundef",
            logoURI: "undef",
            chainId: chainInfo.chainId | 0,
            decimals: 0,
            sortsBefore(other) {
              return false;
            },
            equals(other) {
              return false;
            },
          });
          setPrice(0);
        }
      }
    } else if (chainId === undefined && launchpad && firstSupportedChain) {
      setCurrentChainID(Number(firstSupportedChainID));
      setCurrentChain(firstSupportedChain);
      setInputValue("0");
      setCalculatedValue("0");
      setTokenValues([]);
      if (chainInfo.symbol) {
        setCurrentCurrency({
          symbol: chainInfo.symbol,
          address: chainInfo.address,
          logoURI: chainInfo.logoURI,
          chainId: chainInfo.chainId,
          decimals: chainInfo.decimals,
          sortsBefore(other) {
            return false;
          },
          equals(other) {
            return false;
          },
        });
        refetch();
      } else {
        setCurrentCurrency({
          symbol: "undef",
          address: "0xundef",
          logoURI: "undef",
          chainId: chainInfo.chainId | 0,
          decimals: 0,
          sortsBefore(other) {
            return false;
          },
          equals(other) {
            return false;
          },
        });
      }
    }
  }, [
    launchpad,
    chainId,
    chainInfo,
    chains,
    firstSupportedChain,
    firstSupportedChainID,
    refetch,
  ]);

  // Close the dialog when the chain is changed
  useEffect(() => {
    setDialogOpened(false);
  }, [currentCurrency]);

  useEffect(() => {
    const bodyElement = document.querySelector("body") as {
      style: { overflow: string };
    };
    if (dialogOpened) {
      bodyElement.style.overflow = "hidden";
    } else {
      bodyElement.style.overflow = "";
    }
  }, [dialogOpened]);

  useEffect(() => {
    if (ICOInfo) {
      if (
        isNaN(Math.floor((formatedCurrentSupply * 100) / formatedtokensForSale))
      ) {
        setProgress(100);
      } else {
        setProgress(
          Math.floor((formatedCurrentSupply * 100) / formatedtokensForSale)
        );
      }
    } else {
      setProgress(0);
    }
  }, [ICOInfo, formatedCurrentSupply, formatedtokensForSale]);

  // Adds comma to numbers
  const addComma = (originalNum: number) => {
    let num = String(originalNum);
    let total = num.length % 3;
    let whereIsLastComma;
    if (num.length > 3) {
      if (total !== 0) {
        num = num.slice(0, total) + "," + num.slice(total, num.length);
        whereIsLastComma = total;
      } else {
        num = num.slice(0, 3) + "," + num.slice(3, num.length);
        whereIsLastComma = 3;
      }
      let left = (num.length - 2) / 3 - 1;
      for (let i = 1; i <= left; i++) {
        num =
          num.slice(0, whereIsLastComma + 4) +
          "," +
          num.slice(whereIsLastComma + 4, num.length);
        whereIsLastComma = whereIsLastComma + 4;
      }
    }
    return num;
  };

  function toFixedTrunc(value: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  // The function that handles input changes
  const inputValueChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value;
    const value = Number(stringValue);
    if (stringValue.includes(".") && stringValue.endsWith("0")) {
      setInputValue(stringValue);
    } else if (
      value > 0 &&
      value * Number(price) <= formatedtokensForSale - formatedCurrentSupply &&
      !stringValue.endsWith(".")
    ) {
      setInputValue(String(value));
      setCalculatedValue(String(value * Number(price)));
    } else if (
      value * Number(price) >
      formatedtokensForSale - formatedCurrentSupply
    ) {
      setInputValue(
        String((formatedtokensForSale - formatedCurrentSupply) / Number(price))
      );
      setCalculatedValue(
        String(toFixedTrunc(formatedtokensForSale - formatedCurrentSupply, 3))
      );
      addToast("Can't buy more than available tokens on contract.", "warning");
    } else if (stringValue == "") {
      setInputValue("0");
      setCalculatedValue("0");
    } else if (stringValue.endsWith(".")) {
      setInputValue(stringValue);
      setCalculatedValue(String(value * Number(price)));
    } else if (value == 0) {
      setInputValue("0");
      setCalculatedValue("0");
    }
  };

  // The function that handles the click event of the selectors btns (25%; 50%; 75%; max)
  const selectorFunc = (value: string) => {
    refetch();
    if (currentChainID === chainId) {
      if (balanceValue && balanceValue.value > 0) {
        const calculatedBigInt =
          (balanceValue.value * BigInt(value)) / BigInt(100);
        const formatedBigInt = formatUnits(
          calculatedBigInt,
          Number(balanceValue.decimals)
        );
        if (Number(formatedBigInt) < 0.001) {
          addToast("Amount is less than 0.001", "warning");
          setInputValue("0");
          setCalculatedValue("0");
          return;
        }
        if (
          parseFloat(formatedBigInt) * Number(price) <
          formatedtokensForSale - formatedCurrentSupply
        ) {
          setInputValue(String(toFixedTrunc(Number(formatedBigInt), 3)));
          setCalculatedValue(
            String(
              toFixedTrunc(
                Number(toFixedTrunc(Number(formatedBigInt), 3)) * Number(price),
                3
              )
            )
          );
        } else {
          setInputValue(
            String(
              (formatedtokensForSale - formatedCurrentSupply) / Number(price)
            )
          );
          setCalculatedValue(
            String(formatedtokensForSale - formatedCurrentSupply)
          );
          addToast("Not enough tokens on sale!", "warning");
        }
        if (value == "100" && currentCurrency) {
          let amountToBeDeducted = 0;
          if (
            isNativeToken(currentCurrency.address) &&
            Number(formatedBigInt) > 0
          ) {
            amountToBeDeducted = Number(formatedBigInt) * 0.0005; // deduct 0.05% from the balance
          }
          if (
            Number(formatedBigInt) * Number(price) <
            formatedtokensForSale - formatedCurrentSupply
          ) {
            setInputValue(
              String(
                toFixedTrunc(Number(formatedBigInt) - amountToBeDeducted, 3)
              )
            );
            setCalculatedValue(
              String(
                toFixedTrunc(
                  (toFixedTrunc(Number(formatedBigInt), 3) -
                    amountToBeDeducted) *
                    Number(price),
                  3
                )
              )
            );
          } else {
            setInputValue(
              String(
                (formatedtokensForSale - formatedCurrentSupply) / Number(price)
              )
            );
            setCalculatedValue(
              String(formatedtokensForSale - formatedCurrentSupply)
            );
          }
        }
      } else {
        setInputValue("0");
        setCalculatedValue("0");
      }
    }
  };

  // The function that handles the buy btn's text
  const buyBtnTextHandler = () => {
    if (isConnected) {
      if (currentChainID === chainId) {
        return "Buy";
      } else {
        return `Switch to ${chainInfo.name}`;
      }
    } else {
      return "Connect your wallet";
    }
  };

  // The click event of "Connect Wallet" btn
  const connectWallet = () => {
    setIsOpened(true);
  };

  // The click event of "Buy" btn (place the integration here)
  const buyTokens = useCallback(async () => {
    if (!walletClient || !address || !chainId || !balanceValue?.value) {
      return;
    }

    const amountToPay = Number(inputValue);

    if (isNaN(amountToPay) || !amountToPay) {
      return;
    }

    if (
      amountToPay >
      Number(formatUnits(balanceValue.value, balanceValue.decimals))
    ) {
      addToast("Insufficient balance.", "warning");
      return;
    }

    if (!isAllowed) {
      await writeTokenApprove();
    }

    setOpened(`Buy ${calculatedValue} ${symbol}`);

    const params: {
      account: Address;
      address: Address;
      abi: readonly unknown[];
      functionName: "buyToken";
      args: [string, `0x${string}`];
    } = {
      address: currentChain.icoContract, // here address
      account: address,
      abi: ICOcontract_ABI,
      functionName: "buyToken",
      args: [
        parseUnits(
          calculatedValue,
          currentCurrency?.decimals ? currentCurrency?.decimals : 18
        ).toString(),
        address,
      ],
    };
    try {
      const estimatedGas = await publicClient.estimateContractGas(params);
      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      });
      const hash = await walletClient.writeContract(request);
      if (hash) {
        addTransaction(
          {
            account: address,
            hash,
            chainId,
            title: `Bought ${calculatedValue} ${symbol}`,
          },
          address
        );
        setSubmitted(hash, chainId as any);
        await publicClient.waitForTransactionReceipt({ hash });
      }
    } catch (e) {
      console.log(e);
      setClose();
      addToast("Unexpected error, please contact support", "error");
    }
  }, [
    addTransaction,
    address,
    chainId,
    publicClient,
    currentCurrency?.decimals,
    balanceValue?.value,
    balanceValue?.decimals,
    setClose,
    setOpened,
    setSubmitted,
    walletClient,
    inputValue,
    isAllowed,
    writeTokenApprove,
    currentChain,
    symbol,
    calculatedValue,
  ]);

  // The function that defines the function of the buy / connect wallet / switch network  button
  const buyBtnFunctionHandler = async () => {
    if (isConnected) {
      if (currentChainID === chainId) {
        buyTokens();
      } else {
        await switchNetwork(currentChainID);
      }
    } else {
      connectWallet();
    }
  };

  // Returns the buy button element depending on the current state of the user's wallet and input value
  const isbuttonDisabled = () => {
    if (Number(inputValue) > 0 || chainId !== currentChainID) {
      return (
        <button className="buy-btn" onClick={() => buyBtnFunctionHandler()}>
          {buyBtnTextHandler()}
        </button>
      );
    } else if (Number(inputValue) < 0.001 || isNaN(Number(inputValue))) {
      return (
        <button
          className="buy-btn"
          style={{ background: "#8080809c" }}
          disabled
        >
          {buyBtnTextHandler()}
        </button>
      );
    }
  };

  // Switch network
  const switchNetwork = async (chainID: number) => {
    if (chainId !== chainID) {
      try {
        setSwitchOpened("Change network");
        const connected = await switchChainAsync({ chainId: chainID });
        if (connected) {
          setSwitchClose();
          addToast("Success!", "success");
        }
      } catch (err: any) {
        setSwitchClose();
        addToast("Something went wrong, please try again later.", "error");
      }
    }
  };

  // The function that adds token to metamask
  const handleRegister = async () => {
    const tokenAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: address,
          symbol: symbol,
          decimals: decimals,
          image: logo,
        },
      },
    });
  };

  const claimVesting = useCallback(async () => {
    if (!walletClient || !address || !chainId) {
      return;
    }

    setOpened(
      `Claim ${formatFloat(formatUnits(unlockedAmount, decimals))} ${symbol}`
    );

    const params: {
      address: Address;
      account: Address;
      abi: Abi;
      functionName: "claim";
    } = {
      address: currentChain.vestingContract,
      account: address,
      abi: SLOTH_VESTING_ABI,
      functionName: "claim",
    };

    try {
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      });
      const hash = await walletClient.writeContract(request);
      if (hash) {
        addTransaction(
          {
            account: address,
            hash,
            chainId,
            title: `Claimed ${formatFloat(
              formatUnits(unlockedAmount, decimals)
            )} ${symbol}`,
          },
          address
        );
        setSubmitted(hash, chainId as any);

        await publicClient.waitForTransactionReceipt({ hash });
      }
    } catch (e) {
      console.log(e);
      setClose();
      addToast("Unexpected error, please contact support", "error");
    }
  }, [
    addTransaction,
    address,
    chainId,
    publicClient,
    setClose,
    setOpened,
    setSubmitted,
    unlockedAmount,
    walletClient,
    currentChain,
    decimals,
    symbol,
  ]);

  const handleSwitchTokens = (token: currentCurrencyData) => {
    setCurrentCurrency({
      symbol: token.token.symbol,
      address: token.token.address,
      logoURI: token.token.logoURI,
      chainId: chainInfo.chainId,
      decimals: token.token.decimals,
      sortsBefore(other) {
        return false;
      },
      equals(other) {
        return false;
      },
    });
    setPrice(token.price);
  };

  // Returns SoftCap or HardCap elements depending on the argument (because they are optionnal)
  const descSoftCapHardCapHandler = (symbol: string) => {
    switch (symbol) {
      case "softCap":
        return (
          <p>
            <Image
              width={26}
              height={26}
              src={softCapSVG.src}
              alt="softCap-icon"
            />
            <span>SoftCap: </span>
            {addComma(Number(softCap))} USD
          </p>
        );
      case "hardCap":
        return (
          <p>
            <Image
              width={26}
              height={26}
              src={hardCapSVG.src}
              alt="hardCap-icon"
            />
            <span>Hard Cap: </span>
            {addComma(Number(hardCap))} USD
          </p>
        );
    }
  };

  // the link of the website
  const websiteLink = (
    <a href={website} target="_blank">
      <svg style={{ height: "24px" }}>
        <use href="/sprite.svg#web3"></use>
      </svg>
    </a>
  );

  // the link of the twitter
  const twitterLink = (
    <a href={twitter} target="_blank">
      <svg>
        <use href="/sprite.svg#twitter"></use>
      </svg>
    </a>
  );

  // the link of the telegram
  const telegramLink = (
    <a href={telegram} target="_blank">
      <svg>
        <use href="/sprite.svg#telegram"></use>
      </svg>
    </a>
  );

  const vestingSection = (
    <div className="vestingICO flex flex-col gap-2.5">
      <h2>{saleType}&apos;s Vesting</h2>
      <div className="flex items-center border border-l-orange border-active-border border-l-4 px-5 py-2 gap-2 rounded-2 flex-wrap">
        <Svg className="text-orange" iconName="lock" />
        <span className="text-secondary-text">Locked:</span>{" "}
        <span className="font-bold">
          {lockedAmount + unlockedAmount
            ? formatFloat(formatUnits(lockedAmount, decimals))
            : 0}{" "}
          {symbol}
        </span>
      </div>
      <div className="flex items-center justify-between border border-l-green border-active-border border-l-4 px-5 py-2 rounded-2 gap-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap unlockedText">
            <Svg className="text-green" iconName="coins" />
            <span className="text-secondary-text">
              {symbol} available:
            </span>{" "}
            <span className="font-bold">
              {formatFloat(formatUnits(unlockedAmount, decimals))} {symbol}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-auto claim-btn">
          <PrimaryButton
            fullWidth
            onClick={() => claimVesting()}
            disabled={unlockedAmount === BigInt(0)}
            variant="outlined"
          >
            Claim
          </PrimaryButton>
        </div>
      </div>
      <div className="flex items-center border border-l-blue border-active-border border-l-4 px-5 py-2 gap-2 rounded-2 flex-wrap">
        <Svg className="text-blue" iconName="calendar" />
        <span className="text-secondary-text">Next release date:</span>{" "}
        <span className="font-bold">
          {Number(lockedAmount) != 0
            ? nextUnlock
              ? new Date(Number(nextUnlock) * 1000).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"
            : "—"}
        </span>
      </div>
    </div>
  );

  return (
    <section className="launchpad-details">
      <PageCard>
        <article
          className={`ICO-launchpad ICO-launchpad-${getlabelState.toLowerCase()} ${mediasFound}`}
        >
          <button className="go-back-btn" onClick={onClick}>
            Go Back!
          </button>
          <h1>
            <img src={logo} width={58} alt="logo" />
            <span>{name}</span>
            <article
              className={`state-label state-label-${getlabelState.toLowerCase()}`}
            >
              <article className="marker"></article>
              <p>{getlabelState}</p>
            </article>
            <div>
              {website ? websiteLink : null}
              {twitter ? twitterLink : null}
              {telegram ? telegramLink : null}
            </div>
          </h1>
          <h2>
            Join the {name} {saleType}
          </h2>
          <div className={`ico ${dialogue === "Ended" ? "ico-ended" : ""}`}>
            <h3>
              {dialogue === "Ended" ? null : dialogue + ":"}
              <span>
                {" "}
                {dialogue === "Ended" ? `${saleType} Completed.` : timer}
              </span>
            </h3>
            <p className="completion">Completion: {progress}%</p>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="colored-part" style={{ width: `${progress}%` }}>
                  <div className="white-flash"></div>
                </div>
              </div>
              <p className="start-progress-bar">0 {symbol}</p>
              <p className="maxAmount">
                {addComma(formatedtokensForSale)} {symbol}
              </p>
            </div>
            <div className="separator"></div>
            <p className="pay-amount-p">Amount to pay:</p>
            <a
              onClick={() => selectorFunc("25")}
              className="rounded-1 border border-green duration-200 text-12 h-6 px-2 xl:px-[11px] hover:bg-green/20 text-primary-text amount-selector first-selector-25"
            >
              25%
            </a>
            <a
              onClick={() => selectorFunc("50")}
              className="rounded-1 border border-green duration-200 text-12 h-6 px-2 xl:px-[11px] hover:bg-green/20 text-primary-text amount-selector"
            >
              50%
            </a>
            <a
              onClick={() => selectorFunc("75")}
              className="rounded-1 border border-green duration-200 text-12 h-6 px-2 xl:px-[11px] hover:bg-green/20 text-primary-text amount-selector"
            >
              75%
            </a>
            <a
              onClick={() => selectorFunc("100")}
              className="rounded-1 border border-green duration-200 text-12 h-6 px-2 xl:px-[11px] hover:bg-green/20 text-primary-text amount-selector"
            >
              Max
            </a>
            <br />
            <input
              value={inputValue}
              inputMode="decimal"
              className="hover:border-green focus:border-green"
              onChange={(e) => inputValueChanged(e)}
              type="text"
            />
            <div
              className="currencySymbol"
              onClick={() => setDialogOpened(true)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={currentCurrency ? currentCurrency.logoURI : ""}
                className="logo"
                alt="logo"
              />
              <span className="w-6 h-6 text-primary-text">
                <svg>
                  <use href="/sprite.svg#arrow-bottom"></use>
                </svg>
              </span>
            </div>
            <br />
            <p className="pay-amount-p">{symbol} to receive:</p>
            <br />
            <input
              value={calculatedValue}
              inputMode="decimal"
              onChange={(e) => setCalculatedValue(e.target.value)}
              type="text"
              disabled
            />
            <div className="currencySymbol">
              <img src={logo} className="logo" alt="logo" />
            </div>
            <p className="rate">
              Rate: 1 {currentCurrency ? currentCurrency.symbol : "Loading..."}{" "}
              = {addComma(Number(price))} {symbol}
            </p>
            {dialogue === "Ended" || Date.now() < startDate ? (
              <button className="btn-disabled" disabled>
                {dialogue === "Ended" ? "Ended" : "Coming Soon"}
              </button>
            ) : (
              isbuttonDisabled()
            )}
            <button
              onClick={() => handleRegister()}
              className="text-12 xl:text-14 leading-[18px] flex justify-between items-center text-secondary-text add-token"
            >
              <Image
                className="flex-shrink-0"
                width={24}
                height={24}
                src="/images/wallets/metamask.svg"
                alt=""
              />
              &nbsp;&nbsp;Add {name} ({symbol}) to Metamask
            </button>
          </div>
          {currentChain.vestingContract ? vestingSection : null}
        </article>
      </PageCard>
      <br />
      <PageCard>
        <article className={`launchpad-desc`}>
          <section
            style={{
              borderBottom: "1px solid #404040",
              paddingBottom: "25px",
              marginTop: "16px",
            }}
          >
            <p style={{ margin: "8px 0px 22px" }}>
              <b>Available on:</b>
            </p>
            {Object.keys(launchpad.chains).map((chain) => (
              <div
                className="availableChains"
                key={`AvailableOn${nativeTokens[chain].address}_${nativeTokens[chain].chainId}`}
              >
                <img src={nativeTokens[chain].logoURI} alt="logo" />
                <span
                  onClick={() => switchNetwork(nativeTokens[chain].chainId)}
                  className="inline-flex items-center gap-1 relative after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full"
                >
                  {nativeTokens[chain].name}{" "}
                  <svg>
                    <use href="/sprite.svg#arrow-popup"></use>
                  </svg>
                </span>
              </div>
            ))}
          </section>
          <section
            style={{
              borderBottom: "1px solid #404040",
              paddingBottom: "25px",
            }}
          >
            <p style={{ margin: "33px 0px 13px" }}>
              <b>Description</b>
            </p>
            <p>{description}</p>
          </section>
          <section
            style={{ borderBottom: "1px solid #404040", paddingBottom: "25px" }}
          >
            <p style={{ margin: "33px 0px 13px" }}>
              <b>Token info</b>
            </p>
            <p>
              <Image width={26} height={26} src={nameSVG.src} alt="name-icon" />
              <span>Name: </span>
              {name}
            </p>
            <p>
              {" "}
              <Image
                width={26}
                height={26}
                src={symbolSVG.src}
                alt="name-icon"
              />
              <span>Symbol: </span>
              {symbol}
            </p>
            <p>
              <Image
                width={26}
                height={26}
                src={totalSupplySVG.src}
                alt="name-icon"
              />
              <span>Total Supply: </span>
              {addComma(Number(supply))} {symbol}
            </p>
            <p>
              <Image
                width={26}
                height={26}
                src={decimalsSVG.src}
                alt="name-icon"
              />
              <span>Decimals: </span>
              {decimals}
            </p>
            <p>
              <Image
                width={26}
                height={26}
                src={tokenAddressSVG.src}
                alt="name-icon"
              />
              <span>Token Address: </span>
              <a
                href={`${explorerToken}${currentChain.tokenAddress}`}
                target="_blank"
                className="inline-flex items-center gap-1 relative after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full"
              >
                {currentChain.tokenAddress}{" "}
                <svg style={{ width: "20px", height: "20px" }}>
                  <use href="/sprite.svg#arrow-popup"></use>
                </svg>
              </a>
            </p>
          </section>
          <section>
            <p style={{ margin: "33px 0px 13px" }}>
              <b>{saleType} info</b>
            </p>
            <p>
              <Image
                width={26}
                height={26}
                src={startICOSVG.src}
                alt="name-icon"
              />
              <span>Start time: </span>
              {String(
                `${String(startDateFormat.getUTCMonth() + 1).padStart(
                  2,
                  "0"
                )}/${String(startDateFormat.getUTCDate()).padStart(
                  2,
                  "0"
                )}/${String(startDateFormat.getUTCFullYear())} ${String(
                  startDateFormat.getUTCHours()
                ).padStart(2, "0")}:${String(
                  startDateFormat.getUTCMinutes()
                ).padStart(2, "0")}:${String(
                  startDateFormat.getUTCSeconds()
                ).padStart(2, "0")}`
              )}{" "}
              (UTC)
            </p>
            <p>
              {" "}
              <Image
                width={26}
                height={26}
                src={endICOSVG.src}
                alt="name-icon"
              />
              <span>End time: </span>
              {String(
                `${String(endDateFormat.getUTCMonth() + 1).padStart(
                  2,
                  "0"
                )}/${String(endDateFormat.getUTCDate()).padStart(
                  2,
                  "0"
                )}/${String(endDateFormat.getUTCFullYear())} ${String(
                  endDateFormat.getUTCHours()
                ).padStart(2, "0")}:${String(
                  endDateFormat.getUTCMinutes()
                ).padStart(2, "0")}:${String(
                  endDateFormat.getUTCSeconds()
                ).padStart(2, "0")}`
              )}{" "}
              (UTC)
            </p>
            <p>
              <Image width={26} height={26} src={rateSVG.src} alt="name-icon" />
              <span>Rate (price): </span>1{" "}
              {currentCurrency ? currentCurrency.symbol : "Load"} ={" "}
              {addComma(Number(price))} {symbol}
            </p>
            <p>
              <Image
                width={26}
                height={26}
                src={tokensPresaleSVG.src}
                alt="tokenPresale-icon"
              />
              <span>Tokens for sale: </span>
              {addComma(formatedtokensForSale)} {symbol}
            </p>
            {softCap ? descSoftCapHardCapHandler("softCap") : null}
            {hardCap ? descSoftCapHardCapHandler("hardCap") : null}
            <p>
              <Image
                width={26}
                height={26}
                src={ICOAddressSVG.src}
                alt="name-icon"
              />
              <span>ICO Address: </span>
              <a
                href={`${explorerContract}${currentChain.icoContract}`}
                target="_blank"
                className="inline-flex items-center gap-1 relative after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full"
              >
                {currentChain.icoContract}{" "}
                <svg style={{ width: "20px", height: "20px" }}>
                  <use href="/sprite.svg#arrow-popup"></use>
                </svg>
              </a>
            </p>
          </section>
        </article>
      </PageCard>
      {dialogOpened ? (
        <section className="selectTokenLaunchpad">
          <div
            className="Dialog-overlay"
            style={{
              position: "fixed",
              overflow: "auto",
              inset: "0px",
              transitionProperty: "opacity",
              transitionDuration: "200ms",
            }}
          >
            <span
              data-type="inside"
              aria-hidden="true"
              data-floating-ui-focus-guard=""
              data-floating-ui-inert=""
              style={{
                border: "0px",
                clip: "rect(0px, 0px, 0px, 0px)",
                height: "1px",
                margin: "-1px",
                overflow: "hidden",
                padding: "0px",
                position: "fixed",
                whiteSpace: "nowrap",
                width: "1px",
                top: "0px",
                left: "0px",
              }}
            ></span>
            <div
              className="bg-primary-bg border-primary-border border rounded-5"
              aria-labelledby=":r8e:"
              aria-describedby=":r8f:"
              id=":r8c:"
              role="dialog"
              style={{ width: "390px" }}
            >
              <div className="flex justify-between items-center py-3 pr-2 xl:pr-3 border-b border-primary-border pl-4 xl:pl-10">
                <h3 className="text-24 font-bold">Select a token</h3>
                <button
                  onClick={() => setDialogOpened(false)}
                  className=" w-10 h-10 bg-transparent text-secondary-text hover:bg-secondary-bg hover:text-primary-text flex items-center justify-center duration-200 rounded-full flex-shrink-0"
                >
                  <svg style={{ width: "24px", height: "24px" }}>
                    <use href="/sprite.svg#close"></use>
                  </svg>
                </button>
              </div>
              <div
                className="simplebar-content"
                style={{ padding: "0px 20px" }}
              >
                {tokenValues.length == 0 ? (
                  <p
                    style={{
                      margin: "20px auto",
                      fontSize: "14px",
                      width: "fit-content",
                    }}
                  >
                    {isConnected
                      ? "No tokens are available on this chain."
                      : "Please connect your wallet to continue."}
                  </p>
                ) : (
                  <ul className="mb-5 pt-5">
                    {currentChain.currencies.useNativeAsPayment ? (
                      <li
                        className="flex items-center relative"
                        onClick={() =>
                          handleSwitchTokens({
                            token: {
                              symbol: chainInfo.symbol,
                              address: chainInfo.address,
                              logoURI: chainInfo.logoURI,
                              decimals: chainInfo.decimals,
                              name: "",
                              chainId: currentChainID,
                            },
                            price: currentChain.currencies.nativePrice,
                          } as currentCurrencyData)
                        }
                      >
                        <div className="relative w-full">
                          <button className="w-full h-[60px] group flex items-center justify-between pr-2.5 pl-2.5 rounded-2.5 hover:bg-secondary-bg">
                            <div className="flex items-center gap-2">
                              <Image
                                height="40"
                                width="40"
                                src={chainInfo.logoURI}
                                alt="CLO"
                                style={{ marginRight: "5px" }}
                              />
                              <div className="flex flex-col justify-start items-start">
                                <span className="text-16">
                                  {chainInfo.name}
                                  <span
                                    className="text-12 text-secondary-text"
                                    style={{ marginLeft: "3px" }}
                                  >
                                    {" "}
                                    ({chainInfo.symbol})
                                  </span>
                                </span>
                                <span
                                  className="text-12 text-green"
                                  style={{ fontSize: "10.5px" }}
                                >
                                  1 {chainInfo.symbol} ={" "}
                                  {currentChain.currencies.nativePrice} {symbol}
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      </li>
                    ) : null}
                    {tokenValues.map((token) => (
                      <li
                        className="flex items-center relative"
                        onClick={() => handleSwitchTokens(token)}
                        key={`${token.token.address}_${token.token.name}`}
                      >
                        <div className="relative w-full">
                          <button className="w-full h-[60px] group flex items-center justify-between pr-2.5 pl-2.5 rounded-2.5 hover:bg-secondary-bg">
                            <div className="flex items-center gap-2">
                              <Image
                                height="40"
                                width="40"
                                src={token.token.logoURI}
                                alt="CLO"
                                style={{ marginRight: "5px" }}
                              />
                              <div className="flex flex-col justify-start items-start">
                                <span className="text-16">
                                  {token.token.name}
                                  <span
                                    className="text-12 text-secondary-text"
                                    style={{ marginLeft: "3px" }}
                                  >
                                    {" "}
                                    ({token.token.symbol})
                                  </span>
                                </span>
                                <span className="text-12 text-green price">
                                  1 {token.token.symbol} = {token.price}{" "}
                                  {symbol}
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default Details;
