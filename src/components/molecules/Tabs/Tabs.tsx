import React, {Children, ReactElement, useCallback, useState} from "react";
import TabTitle from "../../atoms/TabTitle";
import styles from "./Tabs.module.scss";
import clsx from "clsx";

interface Props {
  children: ReactElement[],
  view?: "separate" | "merged" | "default",
  size?: "default" | "small",
  className?: string,
  defaultTab?: number
  activeTab?: number,
  setActiveTab?: any
}

function Tabs({ children, view = "merged", className = "", size = "default", defaultTab = 0, activeTab = null, setActiveTab = null }: Props) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || 0);

  return (
    <div className={className}>
      <ul className={clsx(
        styles[`${view}ViewTabsList`]
      )}>
        {children.map((item, index) => (
          <TabTitle
            key={index}
            selectedTab={activeTab || selectedTab}
            title={item.props.title}
            index={index}
            setSelectedTab={setActiveTab || setSelectedTab}
            view={view}
            size={size}
          />
        ))}

      </ul>
      {view === "merged" && <><div
        style={{width: `calc(100% / ${Children.toArray(children).length})`, transform: `translateX(calc(100% * ${selectedTab}))`}}
        className={styles.indicator}
      />
        <div className={styles.spacer} />
        </>
      }
      {children[activeTab || selectedTab]}
    </div>
  );
}

export default Tabs;
