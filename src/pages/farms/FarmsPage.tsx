import React from "react";
import styles from "./FarmsPage.module.scss";
import Layout from "../../shared/layouts/Layout";
import SpecialOffers from "./components/SpecialOffers";
import Farms from "./components/Farms";

export default function FarmsPage() {
  return <Layout>
    <div className="mb-20" />
    <SpecialOffers />
    <div className="mb-20" />
    <Farms />
    <div className="mb-20" />
  </Layout>;
}
