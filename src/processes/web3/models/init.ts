import {
  $account, $blockNumber,
  $chainId,
  $connectionURI,
  $isActive,
  $isChangingNetwork, $isChangingWallet, $isSupportedNetwork, $isSupportedSwapNetwork, $isWalletChangeModalOpened,
  $provider,
  $walletName,
  $web3Provider
} from "./stores";
import {
  setAccount, setBlockNumber,
  setChainId,
  setChangingNetwork, setChangingWallet, setConnectionURI,
  setIsActive, setIsSupportedNetwork, setIsSupportedSwapNetwork,
  setProvider, setWalletChangeModalOpen,
  setWalletName,
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
