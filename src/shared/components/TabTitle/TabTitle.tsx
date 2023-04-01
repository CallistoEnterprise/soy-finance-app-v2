import React from "react";
import styles from "./TabTitle.module.scss";
import clsx from "clsx";

interface Props {
  title: string,
  index: number,
  selectedTab: number,
  setSelectedTab: (index: number) => void,
  view: "separate" | "merged" | "button"
}

function TabTitle({ title, setSelectedTab, index, selectedTab, view }: Props) {

  return (
    <li className={clsx(
      styles.listItem,
      styles[view]
    )}>
      <button className={clsx(
        styles.tabButton,
        styles[`${view}ViewTitle`],
        index === selectedTab && styles.active
      )} onClick={() => setSelectedTab(index)}>{title}</button>
    </li>
  );
}

export default TabTitle;
