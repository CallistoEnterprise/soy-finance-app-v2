import styles from "./styles.module.scss";
import {useTradeHistory} from "../../stores/trade-history/useTradeHistory";
import {useTokenBalance} from "../../stores/balance/useTokenBalance";
import ConnectWalletButton from "../../processes/web3/ui/ConnectWalletButton";
import ChangeWalletModal from "../../processes/web3/ui/ChangeWalletModal";

export default function StoresPage() {
  // const {swap, add, remove, loading} = useTradeHistory();

  const {loading, tokenBalance, updateBalanceNetwork} = useTokenBalance({address: "0x1eAa43544dAa399b87EEcFcC6Fa579D5ea4A6187", chainId: 820});


  return <div>
    <ConnectWalletButton />
    {loading && <div>LOADING</div>}
    <pre>{tokenBalance}</pre>

    <button onClick={() => updateBalanceNetwork(820)}>Update</button>

    <ChangeWalletModal />
  </div>;
}
