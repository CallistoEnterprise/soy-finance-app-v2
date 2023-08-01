import React from "react";
import styles from "./HeaderNav.module.scss";
import useTranslation from "next-translate/useTranslation";
import Svg from "../../atoms/Svg";
import {IconName} from "../../atoms/Svg/svgIconsMap";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {useRouter} from "next/router";

const menuItems: {
  title: string,
  url: string,
  menu?: Array<{
    title: string,
    icon: IconName,
    href?: string
  }>
}[] = [
  {
    title: "exchange",
    url: "#",
    menu: [
      {
        title: "Swap",
        icon: "swap",
        href: "/swap"
      },
      {
        title: "Liquidity",
        icon: "liquidity",
        href: "/liquidity"
      }
    ]
  },
  {
    title: "farming",
    url: "#",
    menu: [
      {
        title: "Farms",
        icon: "farm",
        href: "/farms"
      },
      {
        title: "Boost token",
        icon: "boost"
      },
      {
        title: "Burn & Boost",
        icon: "burn"
      }
    ]
  },
  {
    title: "staking",
    url: "https://app2.soy.finance/pools"
  },
  {
    title: "safety",
    url: "#",
    menu: [
      {
        title: "Safe trading",
        icon: "safe-trading"
      },
      {
        title: "Safelisting",
        icon: "listing"
      }
    ]
  },
  {
    title: "bridge",
    url: "https://bridge.soy.finance/"
  },
  {
    title: "v2",
    url: "https://app2.soy.finance"
  }
];

function NavItemWithMenu({title, menu}) {
  const {showMessage} = useSnackbar();
  const router = useRouter();

  return <div className={styles.navLinkWrapper}>
    <div className={styles.navLink} role="button" >
      {title}
      <Svg iconName="arrow-bottom" />
    </div>
    <div className={styles.walletMenuDropdown}>
      <nav>
        <ul className={styles.walletMenuList}>
          {menu.map((it) => {
            return <li role="button" onClick={() => {
              if(it.href) {
                return router.push(it.href,
                  undefined,
                  {
                    shallow: true
                  })
              }

              showMessage("Coming soon...", "info");
            }} className={styles.walletMenuItem} key={it.title}>
              <Svg iconName={it.icon} />
              {it.title}
            </li>
          })}
        </ul>
      </nav>
    </div>
  </div>
}

export default function HeaderNav() {
  const { t } = useTranslation("common");
  const {showMessage} = useSnackbar();


  return <nav>
    <ul className={styles.menu}>
      {menuItems.map(link => <li key={link.title}>{
        link.menu ? <NavItemWithMenu menu={link.menu} title={t(link.title)} /> :
          <a target="_blank" onClick={(e) => {
            if(link.title === "bridge" || link.title === "v2" || link.title === "staking") {
              return;
            }

            e.preventDefault();

            showMessage("Coming soon...", "info");
          }} className={styles.navLink} href={link.url}>{t(link.title)}</a>
      }</li>)}
    </ul>
  </nav>;
}
