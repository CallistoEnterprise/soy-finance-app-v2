import { useAccount, useBalance, useBlockNumber, useChainId } from "wagmi";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { tokenListInCLO } from "@/config/token-lists/tokenListInCLO";
import { tokenListInBTT } from "@/config/token-lists/tokenlistInBTT";
import { tokenListInETC } from "@/config/token-lists/tokenlistInETC";
import { WrappedToken } from "@/config/types/WrappedToken";
import DialogHeader from "@/components/DialogHeader";
import clsx from "clsx";
import Svg from "@/components/atoms/Svg";
import { MergedTab, MergedTabs } from "@/components/tabs/MergedTabs";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { useFavoriteTokensStore } from "@/stores/useFavoriteTokensStore";
import SimpleBar from "simplebar-react";
import SearchInput from "@/components/atoms/SearchInput";
import { useUserTokensStore } from "@/components/dialogs/stores/useImportTokenDialogStore";
import ImportTokenDialog from "@/components/dialogs/ImportTokenDialog";
import { isNativeToken } from "@/other/isNativeToken";
import {useTranslations} from "use-intl";

export const WCLO_ADDRESS = "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a";
export const WETC_ADDRESS = "0x35e9A89e43e45904684325970B2E2d258463e072";
export const WBTT_ADDRESS = "0x33e85f0e26600a6644b6c910639B0bc7a99fd34e";

export const baseTokens: {
  [key: number]: Array<WrappedToken>
} = {
  820: [
    nativeTokens["820"],
    new WrappedToken(
      820,
      "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
      18,
      "SOY",
      "Soy-ERC223",
      "/images/all-tokens/SOY.svg"
    ),
    new WrappedToken(
      820,
      "0xbf6c50889d3a620eb42C0F188b65aDe90De958c4",
      18,
      "BUSDT",
      "Bulls USD",
      "/images/all-tokens/BUSDT.svg"
    )
  ],
  199:
    [
      nativeTokens["199"],
      new WrappedToken(
        199,
        "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53",
        18,
        "ccCLO",
        "Wrapped CLO",
        "/images/all-tokens/CLO.svg"
      ),
      new WrappedToken(
        199,
        "0xcC00860947035a26Ffe24EcB1301ffAd3a89f910",
        18,
        "SOY",
        "Wrapped SOY",
        "/images/all-tokens/SOY.svg"
      ),
      new WrappedToken(
        199,
        "0xCC78D0A86B0c0a3b32DEBd773Ec815130F9527CF",
        18,
        "BUSDT",
        "Tether",
        "/images/all-tokens/BUSDT.svg"
      )
    ],
  61:
    [
      nativeTokens["61"],
      new WrappedToken(
        61,
        "0xcC67D978Ddf07971D9050d2b424f36f6C1a15893",
        18,
        "SOY",
        "Wrapped SOY",
        "/images/all-tokens/SOY.svg"
      ),
      new WrappedToken(
        61,
        "0xCC48CD0B4a6f50b8f8bf0f9b80eD7881fA547968",
        18,
        "BUSDT",
        "Bulls USD",
        "/images/all-tokens/BUSDT.svg"
      )
    ]
}
export const tokenListMap: {
  [key: number]: WrappedToken[]
} = {
  820: tokenListInCLO,
  61: tokenListInETC,
  199: tokenListInBTT
};

interface Props {
  pickToken: (token: WrappedToken) => void,
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

function PickTokenItem({ token, isFavorite, handlePick, isImported = false }: {
  token: WrappedToken,
  isFavorite: boolean,
  handlePick: any,
  isImported?: boolean
}) {
  const t = useTranslations("PickTokenDialog");

  const { chainId, isConnected } = useAccount();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data, refetch, isLoading } = useBalance({
    address: token ? address : undefined,
    token: token
      ? isNativeToken(token?.address)
        ? undefined
        : token.address as `0x${string}`
      : undefined,
    chainId
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  const { addFavoriteToken, removeFavoriteToken } = useFavoriteTokensStore();

  const { removeToken } = useUserTokensStore();

  return <li className="flex items-center relative" key={token.address}>
    <button
      className={clsx(
        "flex items-center duration-200 justify-center w-10 h-10 rounded-full border border-transparent hover:border-green flex-shrink-0",
        isFavorite ? "text-green" : "text-grey-light")}
      onClick={() => {
        let _chainId = chainId;
        if (!_chainId) {
          _chainId = 820;
        }

        if (isFavorite) {
          removeFavoriteToken(_chainId, token.address);
        } else {
          addFavoriteToken(_chainId, token.address);
        }
      }}>
      <Svg iconName="star"/>
    </button>
    <div className="relative w-full">
      <button
        className="w-full h-[60px] group flex items-center justify-between pr-2.5 pl-2.5 rounded-2.5 hover:bg-secondary-bg"
        onClick={handlePick}>
        <div className="flex items-center gap-2">
          <img height={40} width={40} src={token.logoURI} alt={token.name}/>
          <div className="flex flex-col justify-start items-start">
            <span className="text-16">{token.symbol}</span>
            <span className="text-12 text-secondary-text">{isImported && `${t("added_by_user")} •` + " "}{token.name}</span>
          </div>

        </div>

        <div className="flex gap-2.5 items-center">
          {isConnected && <span>
        {isLoading ? "Loading..." :
          <span className="text-14">{data && data.value ? (+data?.formatted).toFixed(6) : "0.0"}</span>}
      </span>}
        </div>
        {isImported && <button onClick={(e) => {
          e.stopPropagation();
          removeToken(token.address)
        }}
                               className=" rounded-full flex justify-center items-center border-primary-border border absolute -right-2 -top-2 bg-primary-bg w-6 h-6 text-grey-light opacity-0 group-hover:opacity-100 hover:text-red hover:border-red duration-200 transition-colors before:w-9 before:h-9 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2">
          <Svg size={16} iconName="delete"/>
        </button>}
      </button>
    </div>
  </li>
}

export default function PickTokenDialog({ pickToken, isOpen, setIsOpen }: Props) {
  const t = useTranslations("PickTokenDialog");
  const formT = useTranslations("Form");

  const { chainId } = useAccount();
  const [searchRequest, setSearchRequest] = useState("");

  const { userTokens } = useUserTokensStore();

  const wrappedUserTokens = useMemo(() => {
    const tokensForChain = userTokens.filter(t => t.chainId === (chainId || 820));
    return tokensForChain.map((t) => {
      return new WrappedToken(
        chainId || 820,
        t.address,
        t.decimals,
        t.symbol,
        t.name,
        t.logoURI
      )
    })
  }, [chainId, userTokens]);

  const tokens = useMemo(() => {
    if (!chainId) {
      return [nativeTokens[820], ...tokenListInCLO, ...wrappedUserTokens];
    }

    if (chainId && !tokenListMap[chainId]) {
      return [];
    }

    return [nativeTokens[chainId], ...tokenListMap[chainId], ...wrappedUserTokens];
  }, [chainId, wrappedUserTokens]);


  const filteredList = useMemo(() => {
    return tokens.filter((token) => {
      if (!searchRequest) {
        return true;
      }

      if (!token.symbol) {
        return false;
      }

      return token.address.toLowerCase() === searchRequest.toLowerCase()
        || token.symbol?.toLowerCase().startsWith(searchRequest.toLowerCase())
        || token.symbol.replace(/cc/g, "").toLowerCase().startsWith(searchRequest.toLowerCase());

    })
  }, [searchRequest, tokens]);

  const { favoriteTokens } = useFavoriteTokensStore();

  const favoriteTokensForChain = useMemo(() => {
    return favoriteTokens[chainId || 820] || [];
  }, [chainId, favoriteTokens]);

  const favoriteList = useMemo(() => {
    return tokens.filter((token) => {
      return favoriteTokensForChain.includes(token.address);
    })
  }, [favoriteTokensForChain, tokens]);

  const filteredFavoriteList = useMemo(() => {
    return favoriteList.filter((token) => {
      if (!searchRequest) {
        return true;
      }

      if (!token.symbol) {
        return false;
      }

      return token.address.toLowerCase() === searchRequest.toLowerCase()
        || token.symbol?.toLowerCase().startsWith(searchRequest.toLowerCase())
        || token.symbol.replace(/cc/g, "").toLowerCase().startsWith(searchRequest.toLowerCase());

    })
  }, [favoriteList, searchRequest]);

  const [activeTab, setActiveTab] = useState(0);

  const [content, setContent] = useState<"pick" | "import">("pick");


  return <DrawerDialog isOpen={isOpen} setIsOpen={(v) => {
    setIsOpen(v);
    setTimeout(() => setContent("pick"), 400);
  }}>
    {content === "import" &&
      <ImportTokenDialog
        onImport={() => {
          setContent("pick");
          setActiveTab(2);
        }}
        onBack={() => setContent("pick")}
        onClose={() => {
          setTimeout(() => setContent("pick"), 400);
          setIsOpen(false);
        }}/>
    }

    {content === "pick" && <div className="grid w-full sm:w-[490px]">
      <DialogHeader title={t("select_token")} handleClose={() => {
        setIsOpen(false);
        setContent("pick");
      }}/>
      <div>
        <div className="px-10">
          <div className="pt-10 pb-2.5">
            <SearchInput onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchRequest(e.target.value)}
                         placeholder={formT("name_or_address_placeholder")} large/>
          </div>
          {Boolean(baseTokens[chainId || 820]) && <div className="flex justify-between gap-2.5 mb-2.5">
            {baseTokens[chainId || 820].map((token) => {
              return <button key={token.symbol} onClick={() => {
                pickToken(token);
                setIsOpen(false);
              }}
                             className="text-14 h-10 bg-secondary-bg text-primary-text rounded-2 flex items-center gap-1 justify-center w-full duration-200 hover:bg-secondary-hover">
                <img className="w-6 h-6" src={token.logoURI} alt={token.symbol}/>
                {token.symbol}
              </button>
            })}
          </div>
          }
          <MergedTabs activeTab={activeTab} setActiveTab={setActiveTab}>
            <MergedTab title={t("all")}>
              <div className="flex flex-col gap-1 h-[300px]">
                <SimpleBar style={{ maxHeight: 300, margin: "0 -20px", padding: "0 20px" }}>
                  <ul className="mb-5 pt-5">
                    {filteredList.map((token: WrappedToken) => {
                      return <PickTokenItem
                        key={token.address}
                        token={token}
                        handlePick={() => {
                          pickToken(token);
                          setIsOpen(false);
                        }}
                        isFavorite={favoriteTokensForChain.includes(token.address)}
                        isImported={userTokens.map(t => t.address).includes(token.address)}
                      />
                    })}
                  </ul>
                </SimpleBar>
              </div>
            </MergedTab>
            <MergedTab title={t("favorites")}>
              <div className="flex flex-col gap-1 h-[300px]">
                {filteredFavoriteList.length ?
                  <SimpleBar style={{ maxHeight: 300, margin: "0 -20px", padding: "0 20px" }}>
                    <ul className="pt-5">
                      {filteredFavoriteList.map(token => {
                        return <PickTokenItem
                          key={token.address}
                          token={token}
                          handlePick={() => {
                            pickToken(token);
                            setIsOpen(false);
                          }}
                          isFavorite={favoriteTokensForChain.includes(token.address)}
                          isImported={userTokens.map(t => t.address).includes(token.address)}
                        />
                      })}
                    </ul>
                  </SimpleBar> : <div className="my-10 flex flex-col items-center justify-center text-center h-full">
                    <div className="text-green">
                      <Svg size={84} iconName="search"/>
                    </div>
                    <h4 className="mt-2.5 mb-1 text-secondary-text text-24">{t("no_favorite_yet")}</h4>
                    <p className="text-secondary-text text-16">{t("no_tokens_with_name")}</p>
                  </div>
                }
              </div>
            </MergedTab>
            <MergedTab title={t("imported")}>
              <div className="flex flex-col gap-1 h-[300px]">
                {wrappedUserTokens.length ?
                  <SimpleBar style={{ maxHeight: 300, margin: "0 -20px", padding: "0 20px" }}>
                    <ul className="pt-5">
                      {wrappedUserTokens.map(token => {
                        return <PickTokenItem
                          key={token.address}
                          token={token}
                          handlePick={() => {
                            pickToken(token);
                            setIsOpen(false);
                          }}
                          isFavorite={favoriteTokensForChain.includes(token.address)}
                          isImported
                        />
                      })}
                    </ul>
                  </SimpleBar> : <div className="my-10 flex flex-col items-center justify-center text-center h-full">
                    <div className="text-green">
                      <Svg size={84} iconName="custom-tokens"/>
                    </div>
                    <h4 className="mt-2.5 mb-1 text-secondary-text text-24">{t("no_custom_yet")}</h4>
                    <p className="text-secondary-text text-16">{t("no_tokens_with_name")}</p>
                  </div>
                }
              </div>
            </MergedTab>
          </MergedTabs>
        </div>
        <button
          className="p-4 bg-secondary-bg w-full rounded-b-4 text-green duration-200 hover:bg-secondary-hover border-t border-primary-border"
          onClick={() => setContent("import")}>{t("import_token")}
        </button>
      </div>
    </div>}
  </DrawerDialog>
}
