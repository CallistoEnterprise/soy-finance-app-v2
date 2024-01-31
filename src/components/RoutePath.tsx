import { Route } from "@callisto-enterprise/soy-sdk";
import React from "react";
import Svg from "@/components/atoms/Svg";

interface Props {
  route: Route | undefined
}
export default function RoutePath({ route }: Props) {
  return <div>
    {route
      ? <div className="flex items-center gap-1 text-14">
        {route.path.map((r, index) => {
          return <React.Fragment key={index}><span key={r.symbol}>
                {r.symbol}
              </span>
            {index !== route?.path.length - 1 && <Svg size={18} iconName="next"/>}</React.Fragment>;
        })}
      </div>
      : <span>—</span>}
  </div>;
}
