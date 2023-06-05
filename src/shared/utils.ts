export function isNativeToken(address) {
  if (!address) {
    return false;
  }
  return ["0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
    "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
    "0x33e85f0e26600a6644b6c910639B0bc7a99fd34e"].includes(address)
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
