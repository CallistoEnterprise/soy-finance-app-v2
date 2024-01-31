export enum Timeline {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year"
}

export type CandleGraphPoint = {
  x: Date,
  o: number,
  h: number,
  l: number,
  c: number,
  s: [number, number]
}

export type TokensGraphData = {
  [key: string]: {
    [key: string]: number[]
  }
}

export type TokensGraphLabels = {
  [key: string]: {
    [key: string]: Date[]
  }
}

export type TokensCandleGraphData = {
  [key: string]: {
    [key: string]: CandleGraphPoint[]
  }
}
