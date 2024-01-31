import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PropsWithChildren } from "react";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { config } from "@/config/wagmi/config";
import { Providers } from "@/app/[locale]/providers";
import AwaitingDialog from "@/components/AwaitingDialog";
import ConnectWalletDialog from "@/components/dialogs/ConnectWalletDialog";


const montserrat = Montserrat({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Soy.Finance',
}

interface Props {
  params: {
    locale: "fr" | "en" | "uk"
  }
}

export default async function RootLayout({
                                           children,
                                           params: { locale }
                                         }: PropsWithChildren<Props>) {
  let messages;

  const initialState = cookieToInitialState(
    config,
    headers().get('cookie')
  )

  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html className="min-h-[100%]" lang="en" suppressHydrationWarning>
    <head>
      <link rel="icon" href="/favicon.ico" sizes="any"/>
    </head>
    <body className={
      clsx(montserrat.className, "bg-global dark:bg-global-dark duration-200 font-medium h-full")}
    >
    <Providers initialState={initialState} messages={messages} locale={locale}>
      <div className="grid min-h-[100vh] grid-rows-layout">
        <Header/>
        <div>
          {children}
        </div>
        <Footer/>
      </div>
      <AwaitingDialog/>
      <ConnectWalletDialog />
    </Providers>
    </body>
    </html>
  )
}
