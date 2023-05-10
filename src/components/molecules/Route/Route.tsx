import React from "react";
import styles from "./Route.module.scss";
import Svg from "../../atoms/Svg/Svg";

export default function Route({route}) {
  return <div>
    {route
      ? <div className={styles.route}>
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
