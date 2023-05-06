import React from "react";
import styles from "./HeaderNav.module.scss";
import useTranslation from "next-translate/useTranslation";

const menuItems = [
  {
    title: "exchange",
    url: "#"
  },
  {
    title: "staking",
    url: "#"
  },
  {
    title: "farming",
    url: "#"
  },
  {
    title: "safety",
    url: "#"
  },
  {
    title: "future",
    url: "#"
  },
  {
    title: "bridge",
    url: "#"
  }
];

export default function HeaderNav() {
  const { t } = useTranslation("common");

  return <nav>
    <ul className={styles.menu}>
      {menuItems.map(link => <li key={link.title}>
          <a className={styles.navLink} href={link.url}>{t(link.title)}</a>
        </li>)}
    </ul>
  </nav>;
}
