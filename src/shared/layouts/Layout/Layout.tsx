import React from "react";
import styles from "./Layout.module.scss";
import Header from "../../../components/organisms/Header";
import Footer from "../../../components/organisms/Footer";

export default function Layout({children}) {
  return <>
    <Header />
      {children}
    <Footer />
  </>;
}
