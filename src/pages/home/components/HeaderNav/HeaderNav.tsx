import React from "react";
import styles from "./HeaderNav.module.scss";
import useTranslation from "next-translate/useTranslation";

export default function HeaderNav() {
  const { t } = useTranslation("common");

  return <nav>
    <ul className={styles.menu}>
      {
        [
          {
            title: t("exchange"),
            url: "#"
          },
          {
            title: t("staking"),
            url: "#"
          },
          {
            title: t("farming"),
            url: "#"
          },
          {
            title: t("safety"),
            url: "#"
          },
          {
            title: t("future"),
            url: "#"
          },
          {
            title: t("bridge"),
            url: "#"
          }
        ].map(link => <li key={link.title}>
          <a className={styles.navLink} href={link.url}>{link.title}</a>
        </li>)}
    </ul>
  </nav>;
}
