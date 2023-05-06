export type RecentTransaction = {
  hash: string,
  ts: number,
  summary: string,
  status: "pending" | "error" | "succeed"
};
