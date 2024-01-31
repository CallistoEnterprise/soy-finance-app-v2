import { cookieStorage, createConfig, createStorage } from "wagmi";
import { callisto } from "@/config/chains/callisto";
import { classic } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { http } from "viem";
import { bttc } from "@/config/chains/btt";

export const config = createConfig({
  chains: [callisto, classic, bttc],
  connectors: [
    injected({target: "metaMask"}),
    walletConnect({
      projectId: "0af4613ea1c747c660416c4a7a114616"
    }),
    injected({target: "trust"})],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [callisto.id]: http(),
    [classic.id]: http(),
    [bttc.id]: http(),
  },
})
