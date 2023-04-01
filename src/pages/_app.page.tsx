import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import {useScope} from "../shared/models/useScope";
import "/src/shared/models/init";
import { Provider } from "effector-react";
import { robotoFlex } from "../shared/fonts";


export default function App({ Component, pageProps }: AppProps) {
  const scope = useScope(pageProps.initialState);

  return <Provider value={scope}>
    <main className={robotoFlex.className}>
      <Component {...pageProps} />
    </main>

  </Provider>
}
