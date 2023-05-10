import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import {useScope} from "../shared/models/useScope";
import "/src/shared/models/init";
import { Provider } from "effector-react";
import {montserrat} from "../shared/fonts";
import { SnackbarProvider } from "../shared/providers/SnackbarProvider";
import dynamic from "next/dynamic";
import {useInit} from "../processes/web3/hooks/useInit";

const ThemeProvider = dynamic(
  () => import("../shared/providers/ThemeProvider"),
  {
    ssr: false,
  }
);

export default function App({ Component, pageProps }: AppProps) {
  const scope = useScope(pageProps.initialState);

  useInit();

  return <ThemeProvider>
    <SnackbarProvider>
      <Provider value={scope}>
        <main className={montserrat.className}>
          <Component {...pageProps} />
        </main>
      </Provider>
    </SnackbarProvider>
  </ThemeProvider>


}
