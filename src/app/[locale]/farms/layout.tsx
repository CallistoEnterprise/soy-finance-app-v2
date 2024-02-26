import { PropsWithChildren } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Farms | Sloth Finance',
}
export default function Layout({children}: PropsWithChildren) {
  return <>{children}</>
}
