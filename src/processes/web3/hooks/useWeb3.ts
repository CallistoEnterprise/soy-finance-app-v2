import { useEvent, useStore } from "effector-react";
import {
  $account,
  $chainId, $connectionURI,
  $isActive,
  $isChangingNetwork, $isChangingWallet, $isSupportedNetwork, $isSupportedSwapNetwork,
  $provider,
  $walletName,
  $web3Provider
} from "../models/stores";
import {
  setAccount,
  setChainId,
  setChangingNetwork, setChangingWallet, setConnectionURI,
  setIsActive, setIsSupportedNetwork, setIsSupportedSwapNetwork,
  setProvider, setWalletChangeModalOpen,
  setWalletName,
  setWeb3Provider
} from "../models";

import networks from "../constants/networks.json";

import { useCallback, useEffect, useRef } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {BrowserProvider, ethers} from "ethers";

import { SUPPORTED_NETWORKS, SUPPORTED_SWAP_NETWORKS } from "../constants/supportedNetworks";
import { WalletType } from "../types";

export function useWeb3() {
  const chainId = useStore($chainId);
  const isActive = useStore($isActive);
  const provider = useStore($provider);
  const web3Provider = useStore($web3Provider);
  const account = useStore($account);
  const walletName = useStore($walletName);
  const isChangingNetwork = useStore($isChangingNetwork);
  const isChangingWallet = useStore($isChangingWallet);
  const connectionURI = useStore($connectionURI);
  const isSupportedNetwork = useStore($isSupportedNetwork);
  const isSupportedSwapNetwork = useStore($isSupportedSwapNetwork);

  const setChainIdFn = useEvent(setChainId);
  const setIsActiveFn = useEvent(setIsActive);
  const setProviderFn = useEvent(setProvider);
  const setAccountFn = useEvent(setAccount);
  const setWeb3ProviderFn = useEvent(setWeb3Provider);
  const setWalletNameFn = useEvent(setWalletName);
  const setChangingNetworkFn = useEvent(setChangingNetwork);
  const setChangingWalletFn = useEvent(setChangingWallet);
  const setConnectionURIFn = useEvent(setConnectionURI);
  const setWalletChangeModalOpenFn = useEvent(setWalletChangeModalOpen);
  const setIsSupportedNetworkFn = useEvent(setIsSupportedNetwork);
  const setIsSupportedSwapNetworkFn = useEvent(setIsSupportedSwapNetwork);

  const walletNameRef = useRef(walletName);

  const setWalletNameValue = (data: WalletType) => {
    walletNameRef.current = data;
  };

  const syncLocalStorageConnection = useCallback(
    (wallet: WalletType) => {
      const currentConnection = localStorage.getItem("walletconnect");

      if(!currentConnection) {
        return;
      }

      if (wallet === "aw") {
        localStorage.setItem(
          "walletconnect_aw",
          currentConnection
        );
      }

      if (wallet === "walletConnect") {
        localStorage.setItem(
          "walletconnect_wc",
          currentConnection
        );
      }
    },
    []
  );

  useEffect(
    () => {
      if (!chainId) {
        return;
      }

      if (!SUPPORTED_NETWORKS.includes(chainId)) {
        setIsSupportedNetworkFn(false);
      } else {
        setIsSupportedNetworkFn(true);
      }

      if (!SUPPORTED_SWAP_NETWORKS.includes(chainId)) {
        setIsSupportedSwapNetworkFn(false);
      } else {
        setIsSupportedSwapNetworkFn(true);
      }
    },
    [chainId, setIsSupportedNetworkFn, setIsSupportedSwapNetworkFn]
  );

  const connect = useCallback(
    (wallet: WalletType) => {
      try {
        setChangingWalletFn(true);

        let p;
        if (wallet === "metamask") {
          p = (window as any).ethereum;
        }
        if (wallet === "walletConnect" || wallet === "aw") {

          if (wallet === "walletConnect") {

            console.log(2);
            const wcConnection = localStorage.getItem("walletconnect_wc");
            localStorage.removeItem("walletconnect");

            if (wcConnection) {
              localStorage.setItem(
                "walletconnect",
                wcConnection
              );
            }
          }

          if (wallet === "aw") {
            const awConnection = localStorage.getItem("walletconnect_aw");
            localStorage.removeItem("walletconnect");

            if (awConnection) {
              localStorage.setItem(
                "walletconnect",
                awConnection
              );
            }
          }

          p = new WalletConnectProvider({
            qrcode: false,
            rpc: {
              1: "https://mainnet.infura.io/v3/d819f1add1a34a60adab4df578e0e741",
              199: "https://rpc.bt.io/",
              56: "https://bsc-dataseed.binance.org/",
              820: "https://rpc.callisto.network/",
              61: "https://etc.etcdesktop.com/",
              137: "https://polygon-rpc.com"
            },
          });


          console.log("Provider created");

          p.connector.on(
            "display_uri",
            (err, payload) => {
              console.log(err);
              const uri = payload.params[0];
              console.log("Wow");
              console.log(uri);
              setConnectionURIFn(uri);
            }
          );

        }

        (async () => {
          try {
            if(p.enable) {
              const accounts = await p.enable();
              setAccountFn(accounts[0]);
            } else {
              const accounts = await p.request({
                method: "eth_requestAccounts"
              });

              console.log(accounts);

              setAccountFn(accounts[0]);
            }
          } catch (e) {
            console.log(e);
            // setChangingWalletFn(false); ????
          }
          const web3Provider = new BrowserProvider(
            p,
            "any"
          );

          p.on(
            "disconnect",
            () => {
              console.log("Fired disconnect");
              // metamask sometimes fire disconnect event when user switching chains
              // also metamask has no implementation for disconnect event
              // so we can safely disable this listener for metamask to avoid unexpected disconnections
              if (wallet === "metamask") {
                return;
              }

              if (wallet === "aw") {
                localStorage.removeItem("walletconnect_aw");
              }

              if (wallet === "walletConnect") {
                localStorage.removeItem("walletconnect_wc");
              }

              if (wallet === walletNameRef.current) {
                setIsActiveFn(false);
                setWalletNameFn(null);
                setProviderFn(null);
                setWeb3ProviderFn(null);
              }
            }
          );

          p.on(
            "accountsChanged",
            (accounts: any) => {
              if (!accounts.length) {
                setIsActiveFn(false);
                setWalletNameFn(null);
                setProviderFn(null);
                setWeb3ProviderFn(null);
              } else {
                setAccountFn(accounts[0]);
              }
            }
          );

          p.on(
            "chainChanged",
            (cId: number) => {
              let cid = cId;

              if (ethers.isHexString(cId)) {
                cid = parseInt(
                  cId,
                  16
                );
              }

              if (wallet === "aw") {
                const currentAwConnection = localStorage.getItem("walletconnect_aw");
                if (currentAwConnection) {
                  const withChainId = JSON.stringify({
                    ...JSON.parse(currentAwConnection),
                    chainId: cid
                  });
                  localStorage.setItem(
                    "walletconnect_aw",
                    withChainId
                  );
                }
              }

              try {
                if (!SUPPORTED_SWAP_NETWORKS.includes(cid)) {
                  setIsSupportedSwapNetworkFn(false);
                }

                if (!SUPPORTED_NETWORKS.includes(cid)) {
                  setIsSupportedNetworkFn(false);
                }

                return setChainIdFn(cid);
              } catch (e) {
                console.log(e);
              }

            }
          );

          syncLocalStorageConnection(wallet);

          setWeb3ProviderFn(web3Provider);
          setChainIdFn(Number((await web3Provider.getNetwork()).chainId));
          setProviderFn(p);
          setWalletNameFn(wallet);
          setWalletNameValue(wallet);
          setIsActiveFn(true);
          setWalletChangeModalOpenFn(false);
          setChangingWalletFn(false);
        })();
      } catch (e) {
        console.error(e);
      }

    },
    [
      setAccountFn,
      setChainIdFn,
      setChangingWalletFn,
      setConnectionURIFn,
      setIsActiveFn,
      setIsSupportedNetworkFn,
      setIsSupportedSwapNetworkFn,
      setProviderFn,
      setWalletChangeModalOpenFn,
      setWalletNameFn,
      setWeb3ProviderFn,
      syncLocalStorageConnection
    ]
  );

  const changeNetwork = useCallback(
    async (cid: number) => {
      console.log(cid);
      try {
        setChangingNetworkFn(true);
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.toQuantity(cid) }]
        });
        setChainIdFn(cid);
        setChangingNetworkFn(false);
      } catch (e: any) {
        if (e.code === 4902 || e.code === -32603) {
          const curNet = networks.find((n) => {
            return +n.chainId === cid;
          });
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: ethers.toQuantity(cid),
                  chainName: `${curNet?.name}`,
                  rpcUrls: curNet?.rpcs,
                  nativeCurrency: {
                    name: `${curNet?.name}`,
                    symbol: `${curNet?.symbol}`,
                    decimals: 18,
                  },
                  blockExplorerUrls: [`${curNet?.explorer}`],
                },
              ],
            });
          } catch (err) {
            console.error("Can't switch network on metamask because window.ethereum is undefined");
          }
        }
        setChangingNetworkFn(false);
      }

    },
    [provider, setChainIdFn, setChangingNetworkFn]
  );

  const disconnect = useCallback(
    () => {
      console.log(provider);
      if (provider && provider.disconnect) {
        console.log("Triyng to disconnect");
        provider.disconnect();
      }
      setIsActiveFn(false);
      if (walletName === "aw") {
        localStorage.removeItem("walletconnect_aw");
      }

      if (walletName === "walletConnect") {
        localStorage.removeItem("walletconnect_wc");
      }
      if (provider && !provider.disconnect) {
        setChainIdFn(null);
        setAccountFn(null);
        setWalletNameFn(null);
        setProviderFn(null);
        setWeb3ProviderFn(null);
      }
    },
    [provider, setIsActiveFn, setProviderFn, setWalletNameFn, setWeb3ProviderFn, walletName]
  );


  return {
    chainId,
    provider,
    web3Provider,
    account,
    walletName,
    changeNetwork,
    connect,
    disconnect,
    isActive,
    isChangingNetwork,
    connectionURI,
    isSupportedNetwork,
    isSupportedSwapNetwork,
    isChangingWallet
  };
}
