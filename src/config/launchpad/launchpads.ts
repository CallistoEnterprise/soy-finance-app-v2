// NOTE: Media section and Soft / Hard cap are optional if you dont have the infos just let the parameter empty like this:
// parameter: "",
// The card is deleted automaticaly 60d after completion

// minDescription should be around 230 characters its for the launchpad preview (if its too long the text will collide with the address section)
// description can have any length its for the details of the launchpad
// sell type: ICO, presale, IDO...

import { tokensInClo } from "../token-lists/tokenListInCLO";
import { tokensInEtc } from "../token-lists/tokenlistInETC";
import { tokensInBtt } from "../token-lists/tokenlistInBTT";

export const launchpads = {
  card1: {
    // Sale chain info
    chains: {
      "820": {
        tokenAddress: "0xdf4Da43DD3E9918F0784f8c92b8aa1b304C43243",
        icoContract: "0xcDCf1A978553f64AC55F280702D2Cdd239a49beA",
        vestingContract: "0xe5A5837b96176d6E47E541F186B2348DED2c0A1d",
        currencies: {
          useNativeAsPayment: false,
          nativePrice: 0,
          tokens: [
            {token: tokensInClo.busdt, price: 50},
          ],
        }
      },
    },
    // Token info
    logo: "https://pbs.twimg.com/profile_images/1673621481979363329/Zy1KJkVt_400x400.jpg",
    supply: "500000000",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magni ut explicabo, voluptatum inventore iste quae dicta, nobis dolorem quam labore voluptates! Libero, itaque! Fugiat cumque architecto, labore nostrum temporibus atque.",
    minDescription: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magni ut explicabo, voluptatum inventore iste quae dicta, nobis dolorem quam labore voluptates! Libero, itaque! Fugiat cumque architecto, labore nostrum temporibus atque.",
    // Sale info
    saleType: "ICO",
    softCap: "",
    hardCap: "7200000",
    endDate: "30/05/2024 18:00", // DD/MM/YY
    // Media info
    website: "https://www.livediff.com/en",
    twitter: "https://twitter.com/Livediffer",
    telegram: "https://t.me/livediffer",
  },
};