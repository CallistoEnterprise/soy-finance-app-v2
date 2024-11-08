import { useEffect, useState } from "react";
import { Launchpad } from "@/config/types/launchpadTypes";
import Image from "next/image";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import multiChainSVG from "@/../public/images/launchpad-details/multiChain.svg";
import { useReadContract, useAccount } from "wagmi";
import { ERC20_ABI } from "@/config/abis/erc20";
import { ICOcontract_ABI } from "@/config/abis/IcoContract";
import { formatFloat } from "@/other/formatFloat";
import { formatUnits } from "viem";

interface Props {
  children: Launchpad;
  onClick: Function;
  cardState: Function;
  cardIndex: number;
}

type currenciesList = {
  useNativeAsPayment: boolean;
  nativePrice: number;
  tokens: [{ token: { symbol: string; address: string }; price: number }];
};

function Card({ children, onClick, cardState, cardIndex }: Props) {
  // Vars used for funcs
  let [timer, setTimer] = useState("Loading...");
  let [dialogue, setDialogue] = useState("Starts in");
  const [transformState, setTransformState] = useState("");
  // Token/ICO info
  const { chainId } = useAccount() as { chainId: number };
  const [usedChainId, setUsedChainId] = useState(chainId);
  let supportedChain = children.chains[usedChainId];
  let tokenAddress = supportedChain.tokenAddress;
  let icoContract = supportedChain.icoContract;
  const [getlabelState, setLabelState] = useState("Live");
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(0);
  const [price, setPrice] = useState(0);
  const saleType = children.saleType;
  const chainInfo = nativeTokens[Number(usedChainId)];
  const [currentCurrency, setCurrentCurrency] = useState("Loading...");
  const [startDate, setStartDate] = useState(0);
  const [currentSupply, setCurrentSupply] = useState(0);
  const [tokensForSale, setTokensForSale] = useState(0);

  const getExplorerTokenLink = () => {
    switch (chainInfo.chainId) {
      case 199:
        return "https://bttcscan.com/token/";
      case 820:
        return "https://explorer.callisto.network/tokens/";
      case 61:
        return "https://etc.blockscout.com/token/";
    }
  };

  const getExplorerContractLink = () => {
    switch (chainInfo.chainId) {
      case 199:
        return "https://bttcscan.com/address/";
      case 820:
        return "https://explorer.callisto.network/address/";
      case 61:
        return "https://etc.blockscout.com/address/";
    }
  };

  const { data: nameData } = useReadContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    functionName: "name",
  });

  const { data: symbolData } = useReadContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    functionName: "symbol",
  });

  const { data: decimalsData } = useReadContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    functionName: "decimals",
  });

  const { data: ICOinfo } = useReadContract({
    abi: ICOcontract_ABI,
    address: icoContract,
    functionName: "getCurrentRound",
  });

  // links
  const explorerContract = getExplorerContractLink();
  const explorerToken = getExplorerTokenLink();

  // Calls the function to get the current supply and load the animation of cards
  useEffect(() => {
    setTimeout(() => {
      setTransformState("scale(1)");
    }, 200);
    return () => {
      setTransformState("scale(0)");
    };
  }, []);

  useEffect(() => {
    if (nameData) {
      setName(nameData);
    }
    if (symbolData) {
      setSymbol(symbolData);
    }
    if (decimalsData) {
      setDecimals(decimalsData);
    }
  }, [nameData, symbolData, decimalsData]);

  useEffect(() => {
    // Define start and end dates + tokensForSale from the data
    if (ICOinfo) {
      let info = ICOinfo as {
        amount: bigint;
        roundStarts: bigint;
        totalSold: bigint;
      };
      setStartDate(Number(info.roundStarts));
      setCurrentSupply(
        Number(formatFloat(formatUnits(info.totalSold, decimals)))
      );
      setTokensForSale(Number(formatFloat(formatUnits(info.amount, decimals))));
    }
  }, [ICOinfo, decimals]);

  // Define all the necessary variables from the launchpad object
  const { logo, minDescription, endDate } = children as Launchpad;

  useEffect(() => {
    if (!children) return;
    setStartTime(startDate);
    setEndTime(Number(convertDateTimeStringToMilliseconds(endDate)));
    if (supportedChain.currencies.useNativeAsPayment) {
      setCurrentCurrency(String(chainInfo.symbol));
      setPrice(supportedChain.currencies.nativePrice);
    } else {
      const { tokens } = supportedChain.currencies as currenciesList;
      setCurrentCurrency(String(tokens[0].token.symbol));
      setPrice(tokens[0].price);
    }
  }, [
    children,
    startDate,
    endDate,
    chainInfo.symbol,
    supportedChain.currencies,
  ]);

  //  Starts the timer
  useEffect(() => {
    // The function that updates the timer
    const timerUpdater = () => {
      let current = Date.now();
      let timerInMs = startTime - current;
      if (timerInMs < 0 && dialogue !== "Ended") {
        timerInMs = endTime - current;
        setDialogue("Ends in");
        setLabelState("Live");
        cardState({ state: "Live", index: cardIndex });
      } else if (timerInMs > 0) {
        setLabelState("Soon");
        cardState({ state: "Soon", index: cardIndex });
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
        cardState({ state: "Ended", index: cardIndex });
      }
      if (
        currentSupply === tokensForSale &&
        currentSupply != 0 &&
        tokensForSale != 0
      ) {
        setTimer("");
        setDialogue("Ended");
        setLabelState("Ended");
        cardState({ state: "Ended", index: cardIndex });
      }
    };
    if (endTime) {
      if (isNaN(Math.floor((currentSupply * 100) / tokensForSale))) {
        setProgress(100);
      } else {
        setProgress(Math.floor((currentSupply * 100) / tokensForSale));
      }
      timerUpdater();
      const timerInterval = setInterval(timerUpdater, 60000);
      return () => clearInterval(timerInterval);
    }
  }, [tokensForSale, currentSupply, startTime, endTime, cardIndex]);

  // Adds commas to any number (10000 = 10,000)
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

  const sendDataToPage = () => {
    onClick({
      launchpad: children,
      name: name,
      symbol: symbol,
      decimals: decimals,
    });
  };

  // Convert the time to ms
  const convertDateTimeStringToMilliseconds = (dateTimeString: string) => {
    if (dateTimeString) {
      const [dateString, timeString] = dateTimeString.split(" ");
      const [day, month, year] = dateString.split("/").map(Number);
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = Date.UTC(year, month - 1, day, hours, minutes);
      return date;
    }
  };

  // Used to determine the class of the timer based on its state (ended or not)
  const timerStylesCondition = () => {
    return dialogue === "Ended" ? "ended" : "";
  };

  // The main element
  const element = (
    <li
      className={`launchpad launchpad-${getlabelState.toLowerCase()}`}
      style={{ transform: transformState }}
    >
      <div className={`state-label state-label-${getlabelState.toLowerCase()}`}>
        <div className="marker"></div>
        <p>{getlabelState}</p>
      </div>
      <h3
        className={Object.keys(children.chains).length == 2 ? "two-chains" : ""}
      >
        <img width={"61px"} src={logo} alt="logo" />
        <Image
          className="chainLogo"
          src={
            Object.keys(children.chains).length > 2
              ? multiChainSVG.src
              : nativeTokens[Number(Object.keys(children.chains)[0])].logoURI
          }
          width={26}
          height={26}
          alt="chain"
        />
        {Object.keys(children.chains).length == 2 ? (
          <Image
            className="chainLogo second-chain"
            src={nativeTokens[Number(Object.keys(children.chains)[1])].logoURI}
            width={26}
            height={26}
            alt="chain"
          />
        ) : null}
        {name} <span>({symbol})</span>
        <p>
          1 {currentCurrency} = {addComma(Number(price))} {symbol}
        </p>
      </h3>
      <br />
      <b>Completion ({progress}%)</b>
      <div
        className={`state-label state-label-responsive state-label-${getlabelState.toLowerCase()}`}
      >
        <div className="marker"></div>
        <p>{getlabelState}</p>
      </div>
      <br />
      <div className="progress-bar">
        <div className="colored-part" style={{ width: `${progress}%` }}>
          <div className="white-flash"></div>
        </div>
      </div>
      <br />
      <em>{minDescription}</em>
      <p style={{ marginTop: "21px" }}>
        <b className="launchpad-link-title">Token Address </b>
        <a
          target="_blank"
          href={`${explorerToken}${tokenAddress}`}
          className="inline-flex items-center gap-1 relative after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full"
        >
          {tokenAddress}{" "}
          <svg style={{ width: "20px", height: "20px" }}>
            <use href="/sprite.svg#arrow-popup"></use>
          </svg>
        </a>
      </p>
      <p style={{ marginTop: "20px" }}>
        <b className="launchpad-link-title">{saleType} Contract </b>
        <a
          target="_blank"
          href={`${explorerContract}${icoContract}`}
          className="inline-flex items-center gap-1 relative after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full"
        >
          {icoContract}{" "}
          <svg style={{ width: "20px", height: "20px" }}>
            <use href="/sprite.svg#arrow-popup"></use>
          </svg>
        </a>
      </p>
      <br />
      <button
        onClick={sendDataToPage}
        className="h-10 rounded-25 px-6 font-medium border border-green duration-200 flex items-center gap-1 justify-center disabled:bg-transparent disabled:text-grey-light disabled:border-grey-light text-primary-text bg-transparent hover:bg-green/20 false false"
      >
        Details
      </button>
      <p className={`timer ${timerStylesCondition()}`}>
        {dialogue === "Ended" ? null : dialogue + ":"}
        <br />
        <b>{dialogue === "Ended" ? "Completed." : timer}</b>
      </p>
    </li>
  );

  // Delete the card 60d after completion
  return Date.now() < endTime + 60 * 24 * 60 * 60 * 1000 ? element : null;
}

export default Card;
