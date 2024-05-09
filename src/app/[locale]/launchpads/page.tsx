"use client";
import Container from "@/components/atoms/Container";
import React, { useEffect, useState } from "react";
import PageCard from "@/components/PageCard";
import Preloader from "@/components/atoms/Preloader";
import Card from "./Card";
import Details from "./Details";
import { launchpads } from "@/config/launchpad/launchpads";
import { Launchpad, ChainDetails } from "@/config/types/launchpadTypes";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import SelectChain from "./SelectChain";
import { useAccount } from "wagmi";
import addToast from "@/other/toast";

type LaunchpadData = {
  launchpad: Launchpad;
  name: string;
  symbol: string;
  decimals: number;
};

type cardState = {
  index: number;
  state: string;
};

export default function LaunchpadPage() {
  const { chainId } = useAccount() as { chainId: number };
  const [details, setDetails] = useState<LaunchpadData | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);
  const [cardData, setCardData] = useState<LaunchpadData>();
  const [selectedChain, setSelectedChain] = useState(0);
  const [selectedCards, setSelectedCards] = useState<Launchpad[]>([]);
  const [cardsState, setCardsState] = useState<cardState[]>([]);

  useEffect(() => {
    if (selectedChain === 0) {
      setCardsState([]);
      setSelectedCards([]);
    }
  }, [selectedChain]);

  useEffect(() => {
    if (
      launchpads &&
      selectedChain !== 0 &&
      Object.keys(launchpads).length > 0
    ) {
      let cards = [] as Launchpad[];
      for (const launchpad of Object.values(launchpads)) {
        const dataToBePushed = {
          launchpad: launchpad as Launchpad,
        };
        cards.push(dataToBePushed.launchpad);
      }
      const sortedKeys = cards.filter((card) => selectedChain in card.chains);
      setSelectedCards([...sortedKeys]);
      setLoading(true);
    } else if (launchpads) {
      setLoading(false);
    }
  }, [selectedChain]);

  useEffect(() => {
    // Detects if there are cards or no
    const fetchLaunchpads = async () => {
      const updatedLiveList: Launchpad[] = [];
      const updatedSoonList: Launchpad[] = [];
      const updatedEndedList: Launchpad[] = [];

      for (const launchpad of Object.values(selectedCards)) {
        try {
          const dataToBePushed = {
            launchpad: launchpad as Launchpad,
          };
          const state = cardsState.find(
            (card) =>
              card.index === Object.values(selectedCards).indexOf(launchpad)
          )?.state;
          switch (state) {
            case "Soon":
              updatedSoonList.push(dataToBePushed.launchpad);
              break;
            case "Live":
              updatedLiveList.push(dataToBePushed.launchpad);
              break;
            case "Ended":
              updatedEndedList.push(dataToBePushed.launchpad);
              break;
            default:
              break;
          }
        } catch (err) {
          setLoading(false);
          setErrorOccurred(true);
          console.error("Error occurred while fetching launchpad:", err);
        }
      }
      const cardList = updatedLiveList.concat(
        updatedSoonList,
        updatedEndedList
      );
      const sortedKeys = cardList.filter(
        (card) => selectedChain in card.chains
      );
      setSelectedCards(sortedKeys);
      setLoading(false);
    };
    if (
      selectedChain &&
      cardsState.length === Object.keys(selectedCards).length
    ) {
      try {
        setLoading(true);
        fetchLaunchpads();
      } catch (err) {
        setLoading(false);
        setErrorOccurred(true);
        console.error("Error occurred in useEffect:", err);
      }
    }
  }, [cardsState, details]);

  useEffect(() => {
    setDetails(cardData);
  }, [cardData]);

  const detailsClickHandler = () => {
    if (chainId == selectedChain) {
      setDetails(null);
    } else {
      setSelectedChain(0);
      addToast("Chain change detected. Please select again.", "info");
      setDetails(null);
    }
  };

  const handleDataFromCard = (data: LaunchpadData) => {
    setCardData(data);
  };

  const handleCardState = (state: cardState) => {
    const listOfStates = cardsState;
    listOfStates[state.index] = state;
    setCardsState([...listOfStates]);
  };

  const container = (
    <PageCard>
      <div
        style={{ margin: "100px auto", display: `${loading ? "" : "none"}` }}
      >
        <Preloader />
      </div>
      <div style={{ display: `${loading ? "none" : ""}` }}>
        <p
          className="launchpads-list-return"
          onClick={() => setSelectedChain(0)}
        >
          Return
        </p>
        <h2 className="launchpad-list-heading">
          Launchpads on{" "}
          {chainId && nativeTokens[chainId]
            ? nativeTokens[chainId].name
            : "Loading..."}
        </h2>
        <ul className="launchpads-list" style={{ margin: "0 auto" }}>
          {selectedCards.map((launchpadData, index) => {
            const launchpad = launchpadData;
            const firstSupportedChainKey = Object.keys(launchpad.chains)[0];
            return (
              <Card
                key={`Card.${launchpad.chains[firstSupportedChainKey].tokenAddress}`}
                onClick={handleDataFromCard}
                cardState={handleCardState}
                cardIndex={index}
              >
                {launchpad}
              </Card>
            );
          })}
        </ul>
      </div>
    </PageCard>
  );
  return (
    <div
      className={
        !loading && !errorOccurred && selectedChain ? "" : "no-launchpads"
      }
    >
      <Container>
        {errorOccurred ? (
          <PageCard>
            <p>
              An error occured while loading the cards, please refresh the page.
            </p>
          </PageCard>
        ) : (
          <div className="w-full mx-auto my-5">
            {selectedChain ? (
              details ? (
                <Details onClick={() => detailsClickHandler()}>
                  {details}
                </Details>
              ) : (
                container
              )
            ) : (
              <PageCard>
                {loading ? (
                  <div style={{ margin: "100px auto" }}>
                    <Preloader />
                  </div>
                ) : (
                  <SelectChain
                    supportedChains={nativeTokens}
                    setChain={setSelectedChain}
                  ></SelectChain>
                )}
              </PageCard>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
