import { PropsWithChildren } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Liquidity | Sloth Finance',
}
export default function Layout({children}: PropsWithChildren) {
  return <>{children}</>
}
