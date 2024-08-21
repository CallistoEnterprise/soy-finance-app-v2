export const ICOcontract_ABI = [
  {
    "type":"event",
    "name":"BuyToken",
    "inputs":[
      {
        "type":"address",
        "name":"buyer",
        "internalType":"address",
        "indexed":false
      },
      {
        "type":"uint256",
        "name":"round",
        "internalType":"uint256",
        "indexed":false
      },
      {
        "type":"uint256",
        "name":"amountToPay",
        "internalType":"uint256",
        "indexed":false
      },
      {
        "type":"uint256",
        "name":"amountToBuy",
        "internalType":"uint256",
        "indexed":false
      },
      {"type":"uint256","name":"bonus","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","internalType":"address","indexed":true},{"type":"address","name":"newOwner","internalType":"address","indexed":true}],"anonymous":false},{"type":"event","name":"Rescue","inputs":[{"type":"address","name":"_token","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"RoundEnds","inputs":[{"type":"uint256","name":"round","internalType":"uint256","indexed":false},{"type":"uint256","name":"starTime","internalType":"uint256","indexed":false},{"type":"uint256","name":"endTime","internalType":"uint256","indexed":false},{"type":"uint256","name":"lastSoldAmount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"SetBonusData","inputs":[{"type":"uint256","name":"_bonusReserve","internalType":"uint256","indexed":false},{"type":"uint256","name":"_bonusPercentage","internalType":"uint256","indexed":false},{"type":"uint256","name":"_bonusActivator","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"ICOtoken","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"VUSD","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"_buyToken","inputs":[{"type":"address","name":"payToken","internalType":"address"},{"type":"uint256","name":"amountToBuy","internalType":"uint256"},{"type":"address","name":"buyer","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"addRound","inputs":[{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint128","name":"price","internalType":"uint128"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"bonusActivator","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"bonusPercentage","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"bonusReserve","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"buyToken","inputs":[{"type":"uint256","name":"amountToBuy","internalType":"uint256"},{"type":"address","name":"buyer","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"buyTokenVirtual","inputs":[{"type":"uint256","name":"amountToBuy","internalType":"uint256"},{"type":"address","name":"buyer","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"changRound","inputs":[{"type":"uint256","name":"roundId","internalType":"uint256"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint128","name":"price","internalType":"uint128"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"cliffPeriod","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"currentRound","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"tuple","name":"r","internalType":"struct ICO.Round","components":[{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint128","name":"price","internalType":"uint128"},{"type":"uint128","name":"roundStarts","internalType":"uint128"},{"type":"uint256","name":"totalSold","internalType":"uint256"},{"type":"uint256","name":"totalReceived","internalType":"uint256"}]}],"name":"getCurrentRound","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"roundsNumber","internalType":"uint256"}],"name":"getRoundsNumber","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"initialize","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"isPause","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"owner","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"paymentToken","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"rescueTokens","inputs":[{"type":"address","name":"_token","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint128","name":"price","internalType":"uint128"},{"type":"uint128","name":"roundStarts","internalType":"uint128"},{"type":"uint256","name":"totalSold","internalType":"uint256"},{"type":"uint256","name":"totalReceived","internalType":"uint256"}],"name":"rounds","inputs":[{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setBonusData","inputs":[{"type":"uint256","name":"_bonusReserve","internalType":"uint256"},{"type":"uint256","name":"_bonusPercentage","internalType":"uint256"},{"type":"uint256","name":"_bonusActivator","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setPause","inputs":[{"type":"bool","name":"pause","internalType":"bool"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setRoundSold","inputs":[{"type":"uint256","name":"roundId","internalType":"uint256"},{"type":"uint256","name":"soldAmount","internalType":"uint256"},{"type":"uint256","name":"receivedAmount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setStartDate","inputs":[{"type":"uint256","name":"_startDate","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setVesting","inputs":[{"type":"address","name":"_vestingContract","internalType":"address"},{"type":"uint256","name":"_unlockPercentage","internalType":"uint256"},{"type":"uint256","name":"_cliffPeriod","internalType":"uint256"},{"type":"uint256","name":"_vestingPercentage","internalType":"uint256"},{"type":"uint256","name":"_vestingInterval","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"startDate","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bytes4","name":"","internalType":"bytes4"}],"name":"tokenReceived","inputs":[{"type":"address","name":"","internalType":"address"},{"type":"uint256","name":"","internalType":"uint256"},{"type":"bytes","name":"","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"transferOwnership","inputs":[{"type":"address","name":"newOwner","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"unlockPercentage","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"vestingContract","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"vestingInterval","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}
    ],
    "name":"vestingPercentage",
    "inputs":[]
  }
]