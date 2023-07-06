import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const setInitialTheme = `
    function getUserPreference() {
      if(window.localStorage.getItem('color-theme')) {
        return window.localStorage.getItem('color-theme')
      }
      return 'light'
    }
    document.body.dataset.colorTheme = getUserPreference();
  `;

  return (
    <Html lang="en">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }}/>
        <Main />
        <div id="dialog-root" />
        <div id="drawer-root" />
        <div id="dropdown-root" />
        <div id="select-root" />
        <NextScript />
      </body>
    </Html>
  )
}
