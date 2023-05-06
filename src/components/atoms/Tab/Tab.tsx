import React from "react";
import styles from "./Tab.module.scss";
import clsx from "clsx";

interface Props {
  title: string,
  children: any
}

function Tab({ children }: Props) {
  return <div className={clsx(
    styles.tabContent
  )}>{children}</div>;
}

export default Tab;
