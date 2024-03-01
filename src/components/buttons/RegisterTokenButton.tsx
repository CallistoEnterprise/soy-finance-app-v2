import { TokenInfo } from "@/config/types/TokenInfo";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  token: TokenInfo
}

export default function RegisterTokenButton({ token, ...props }: Props) {
  const handleRegister = async (token: TokenInfo) => {
    const tokenAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.logoURI
        }
      }
    });
  }
  return <button onClick={()=>handleRegister(token)} className="text-12 xl:text-14 leading-[18px] flex justify-between items-center text-secondary-text">
    <img className="flex-shrink-0" width={24} height={24} src="/images/wallets/metamask.svg" alt=""/>
    &nbsp;&nbsp;Add {token.name} ({token.symbol}) to Metamask 
  </button>
}
