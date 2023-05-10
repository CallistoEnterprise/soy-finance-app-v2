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

export function formatBalanceToSix(balance) {
  if(!balance) {
    return "0.0";
  }

  return Number(balance).toFixed(6)
    .replace(
      /\.00000000/,
      ".0"
    );
}

export function formatBalanceToEight(balance) {
  if(!balance) {
    return "0.0";
  }

  return Number(balance).toFixed(8)
    .replace(
      /\.00000000/,
      ".0"
    );
}

export function formatAddress(address: string | null) {
  if (!address) {
    return "";
  }

  return `${address.substring(0, 4)}...${address.slice(-4)}`;
}
