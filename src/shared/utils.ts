export function isNativeToken(address) {
  if (!address) {
    return false;
  }
  return address.slice(
    0,
    -2
  ) === "0x00000000000000000000000000000000000000";
}

export function formatBalance(balance) {
  if(!balance) {
    return "0.0";
  }

  return Number(balance).toFixed(4)
    .replace(
      /\.0000/,
      ".0"
    );
}
