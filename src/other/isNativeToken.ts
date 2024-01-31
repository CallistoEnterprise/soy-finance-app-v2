import { WBTT_ADDRESS, WCLO_ADDRESS, WETC_ADDRESS } from "@/components/dialogs/PickTokenDialog";

export function isNativeToken(address: `0x${string}` | string) {
  if (!address) {
    return false;
  }

  return Boolean([
    WCLO_ADDRESS,
    WETC_ADDRESS,
    WBTT_ADDRESS
  ].filter((ad) => ad.toLowerCase() === address.toLowerCase()).length)
}
