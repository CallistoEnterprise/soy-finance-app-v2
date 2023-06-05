import {Contract} from "ethers";

interface Call {
  address: string | undefined,
  callData: string
}

export async function aggregate(contract: Contract, calls: Call[]) {
  const [resultsBlockNumber, returnData] = await contract["aggregate"](calls.map((c) => {
    return [c.address, c.callData];
  }));

  return {
    resultsBlockNumber,
    returnData
  }
}
