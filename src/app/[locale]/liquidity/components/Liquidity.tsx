import { useState } from "react";
import AddLiquidity from "@/app/[locale]/liquidity/components/AddLiquidity";
import YourLiquidity from "@/app/[locale]/liquidity/components/YourLiquidity";
import clsx from "clsx";

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState(0);
  return <div className="bg-primary-bg sm:rounded-5 border-y sm:border border-primary-border overflow-hidden">
    <div className="flex">
      <button className={clsx(
        "flex-1 h-10 w-full text-primary-text text-16 border-primary-border border-r",
        activeTab === 0 ? "bg-primary-bg" : "bg-secondary-bg border-b"
      )}
              onClick={() => setActiveTab(0)}>Active
      </button>
      <button className={clsx(
        "flex-1 h-10 w-full text-primary-text text-16 border-primary-border",
        activeTab === 1 ? "bg-primary-bg" : "bg-secondary-bg border-b"
      )}
              onClick={() => setActiveTab(1)}>Add
      </button>
    </div>
    {activeTab === 0 && <div className="p-5">
      <YourLiquidity setActiveTab={setActiveTab}/>
    </div>}
    {activeTab === 1 && <div className="p-5">
      <AddLiquidity/>
    </div>}
  </div>
}
