import React from "react";
import styles from "./Layout.module.scss";
import Header from "../../organisms/Header";
import Footer from "../../organisms/Footer";

export default function Layout({children}) {
  return <>
    <Header />
      {children}
    <Footer />
  </>;
}
