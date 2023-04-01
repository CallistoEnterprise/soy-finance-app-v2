import React from "react";
import styles from "./LanguageDialog.module.scss";
import DialogCloseButton from "../../../../shared/components/DialogCloseButton";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import Dialog from "../../../../shared/components/Dialog";
import useTranslation from "next-translate/useTranslation";
import {useRouter} from "next/router";

interface Props {
  langOpened: boolean,
  setLangOpened: any
}

export default function LanguageDialog({ langOpened, setLangOpened }: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return <Dialog isOpen={langOpened} onClose={() => setLangOpened(false)}>
    <DialogCloseButton handleClose={() => setLangOpened(false)} />
    <div className={styles.langDialog}>
      <h4 className={styles.langHeading}>{t("language")}</h4>
      <div className={styles.langPickerWrapper}>
        {[
          {
            lang: "en",
            flag: "/images/flags/en.svg",
            label: "English"
          },
          {
            lang: "uk",
            flag: "/images/flags/uk.svg",
            label: "Українська"
          },
          {
            lang: "fr",
            flag: "/images/flags/fr.svg",
            label: "Français"
          }
        ].map(lan => {
          return <Link onClick={() => {
            setLangOpened(false)
          }} href="/" locale={lan.lang} key={lan.lang}  className={clsx(
            styles.langButton,
            locale === lan.lang && styles.active
          )}>
                 <span>
                   <Image width={78} height={78} src={lan.flag} alt={lan.label} />
                 </span>
            <span>
                  {lan.label}
                 </span>
          </Link>
        })}
      </div>
    </div>

  </Dialog>;
}
