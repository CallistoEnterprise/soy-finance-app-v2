import React, { ReactElement, useState } from "react";
import TabTitle from "../TabTitle";
import styles from "./Tabs.module.scss";
import clsx from "clsx";

interface Props {
  children: ReactElement[],
  view?: "separate" | "merged" | "button",
  className?: string
}

function Tabs({ children, view = "merged", className = "" }: Props) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className={className}>
      <ul className={clsx(
        styles[`${view}ViewTabsList`]
      )}>
        {children.map((item, index) => (
          <TabTitle
            key={index}
            selectedTab={selectedTab}
            title={item.props.title}
            index={index}
            setSelectedTab={setSelectedTab}
            view={view}
          />
        ))}
      </ul>
      {children[selectedTab]}
    </div>
  );
}

export default Tabs;
