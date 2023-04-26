import {
  $account, $blockNumber,
  $chainId,
  $connectionURI,
  $isActive,
  $isChangingNetwork, $isChangingWallet, $isSupportedNetwork, $isSupportedSwapNetwork, $isWalletChangeModalOpened,
  $provider,
  $walletName, $wc2blockchains,
  $web3Provider
} from "./stores";
import {
  disableWc2Blockchain,
  enableWc2Blockchain,
  setAccount, setBlockNumber,
  setChainId,
  setChangingNetwork, setChangingWallet, setConnectionURI,
  setIsActive, setIsSupportedNetwork, setIsSupportedSwapNetwork,
  setProvider, setWalletChangeModalOpen,
  setWalletName, setWc2Blockchains,
  setWeb3Provider
} from "./index";


$chainId.on(
  setChainId,
  (_, data) => data
);

$isActive.on(
  setIsActive,
  (_, data) => data
);

$provider.on(
  setProvider,
  (_, data) => data
);

$web3Provider.on(
  setWeb3Provider,
  (_, data) => data
);

$account.on(
  setAccount,
  (_, data) => data
);

$connectionURI.on(
  setConnectionURI,
  (_, data) => data
);

$isChangingNetwork.on(
  setChangingNetwork,
  (_, data) => data
);

$walletName.on(
  setWalletName,
  (_, data) => data
);

$isSupportedNetwork.on(
  setIsSupportedNetwork,
  (_, data) => data
);

$isSupportedSwapNetwork.on(
  setIsSupportedSwapNetwork,
  (_, data) => data
);

$blockNumber.on(
  setBlockNumber,
  (_, data) => data
);


$isChangingWallet.on(
  setChangingWallet,
  (_, data) => {
    return data;
  }
);

$isWalletChangeModalOpened.on(
  setWalletChangeModalOpen,
  (_, data) => data
);

$wc2blockchains.on(
  enableWc2Blockchain,
  (_, data) => {
    localStorage.setItem("wcChainList", JSON.stringify([..._, data]));
    return [..._, data];
  }
)

$wc2blockchains.on(
  disableWc2Blockchain,
  (_, data) => {
    const result = _.filter(v => v !== data);
    localStorage.setItem("wcChainList", JSON.stringify(result))
    return result;
  }
)

$wc2blockchains.on(
  setWc2Blockchains,
  (_, data) => {
    return data;
  }
)
