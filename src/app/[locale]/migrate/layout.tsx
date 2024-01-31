import { PropsWithChildren } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Migrate | Soy.Finance',
}
export default function Layout({children}: PropsWithChildren) {
  return <>{children}</>
}
