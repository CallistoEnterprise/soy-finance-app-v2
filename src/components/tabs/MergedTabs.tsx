import { Children, PropsWithChildren, ReactElement, useState } from "react";
import clsx from "clsx";

interface TabProps {
  title: string
}

export function MergedTab({children}: PropsWithChildren<TabProps>) {
  return <div className="flex-grow">{children}</div>
}

interface TitleProps {
  title: string,
  index: number,
  selectedTab: number,
  setSelectedTab: (index: number) => void,
  size?: "default" | "small"
}

function MergedTitle({ title, setSelectedTab, index, selectedTab }: TitleProps) {
  return <li className="flex-1">
    <button className={clsx(
      "rounded-t-2 bg-transparent h-10 w-full rounded-2 min-w-[120px] px-1 " +
      "text-16 relative after:absolute after:left-0 after:w-full after:h-[2px] " +
      "after:top-full after:bg-secondary-hover after:duration-200 hover:after:bg-green",
      index === selectedTab ? "text-green" : "text-primary-text"
    )} onClick={() => setSelectedTab(index)}>{title}</button>
  </li>
}

interface Props {
  children: ReactElement[],
  view?: "separate" | "merged" | "default",
  size?: "default" | "small",
  className?: string,
  defaultTab?: number
  activeTab?: number | null,
  setActiveTab?: any
}

export function MergedTabs({ children, className = "", size = "default", defaultTab = 0, activeTab = null, setActiveTab = null }: Props) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || 0);

  return <div className={className}>
    <ul className="flex">
      {children.map((item: ReactElement, index: number) => {
        return (

        <MergedTitle
          key={index}
          selectedTab={activeTab != null ? activeTab : selectedTab}
          title={item.props.title}
          index={index}
          setSelectedTab={setActiveTab || setSelectedTab}
          size={size}
        />
      )})}

    </ul>
    <div
      style={{ width: `calc(100% / ${Children.toArray(children).length})`, transform: `translateX(calc(100% * ${activeTab != null ? activeTab : selectedTab}))` }}
      className="h-[2px] bg-green duration-200"
    />
    {children[activeTab != null ? activeTab : selectedTab]}
  </div>
}

