import ConnectWalletButton from "../../processes/web3/ui/ConnectWalletButton";
import ChangeWalletModal from "../../processes/web3/ui/ChangeWalletModal";
import {useWeb3} from "../../processes/web3/hooks/useWeb3";
import Header from "../../components/organisms/Header";

export default function StoresPage() {
  const {chainId, changeNetwork} = useWeb3();

  return <div>
    <Header />
    <ConnectWalletButton />

    Chain: {chainId}

    {/*<Button onClick={() => changeNetwork(820)}>Change to Callisto</Button>*/}
    {/*<Button onClick={() => changeNetwork(199)}>Change to Btt</Button>*/}

    <ChangeWalletModal />
  </div>;
}
