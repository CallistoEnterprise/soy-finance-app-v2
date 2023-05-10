import React from "react";
import styles from "./LanguageDialog.module.scss";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import Dialog from "../../../../components/molecules/Dialog";
import useTranslation from "next-translate/useTranslation";
import {useRouter} from "next/router";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import useMediaQuery from "../../../../shared/hooks/useMediaQuery";

interface Props {
  langOpened: boolean,
  setLangOpened: any
}

export default function LanguageDialog({ langOpened, setLangOpened }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale, pathname, asPath, query } = useRouter();

  const { showMessage } = useSnackbar();

  const isMobile = useMediaQuery("(max-width: 600px)");

  return <DrawerDialog isOpen={langOpened} onClose={() => setLangOpened(false)}>
    <DialogHeader handleClose={() => setLangOpened(false)} title={t("language")} />
    <div className={styles.langDialog}>
      {!isMobile ? <div className={styles.langPickerWrapper}>
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
          return <button onClick={() => {
            router.push({ pathname, query }, asPath, { locale: lan.lang });
            setLangOpened(false);
            showMessage("Language changed");
          }} key={lan.lang}  className={clsx(
            styles.langButton,
            locale === lan.lang && styles.active
          )}>
                 <span>
                   <Image width={78} height={78} src={lan.flag} alt={lan.label} />
                 </span>
            <span>
                  {lan.label}
           </span>
          </button>
        })}
      </div> : <div className={styles.langPickerWrapper}>
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
          return <button onClick={() => {
            router.push({ pathname, query }, asPath, { locale: lan.lang });
            setLangOpened(false);
            showMessage("Language changed");
          }} key={lan.lang}  className={clsx(
            styles.mobileLangButton,
            locale === lan.lang && styles.active
          )}>
                 <span style={{width: 32, height: 32}}>
                   <Image width={32} height={32} src={lan.flag} alt={lan.label} />
                 </span>
            <span>
                  {lan.label}
           </span>
          </button>
        })}
      </div>}
    </div>

  </DrawerDialog>;
}
