import Svg from "@/components/atoms/Svg";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import { ButtonHTMLAttributes, useState } from "react";
import Popover from "@/components/atoms/Popover";
import DialogHeader from "@/components/DialogHeader";
import Switch from "@/components/atoms/Switch";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useLocale } from "next-intl";
import clsx from "clsx";
import { usePathname, useRouter, locales } from "@/navigation";
import addToast from "@/other/toast";
import { useTranslations } from "use-intl";

type SettingsContent = "settings" | "language";

interface LangButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  label:string,
  flagURI: string,
  isActive: boolean
}
function LangButton({label, flagURI, isActive, ...props}: LangButtonProps) {
  return <button
    {...props}
    className={clsx(
      "py-3.5 px-5 gap-2.5 flex items-center border rounded-2 duration-200",
       isActive ? "bg-green/20 border-green" : "bg-transparent border-primary-border hover:border-green")}>
    <Image src={flagURI} alt="" width={32} height={32} />
    {label}
  </button>
}

const localesMap: {
  [key: string]: {
    img: string,
    label: string
  }
} = {
  en: {
    img: "/images/flags/en.svg",
    label: "English"
  },
  fr: {
    img: "/images/flags/fr.svg",
    label: "France"
  },
  uk: {
    img: "/images/flags/uk.svg",
    label: "Українська"
  }
}
export default function SettingsMenu() {
  const t = useTranslations("SettingsAndWallet");

  const [isSettingsOpened, setSettingsOpened] = useState(false);
  const { theme, setTheme } = useTheme();
  const [content, setContent] = useState<SettingsContent>("settings");
  const locale = useLocale();
  const pathName = usePathname();
  const router = useRouter();
  const redirectedPathName = (locale: string) => {
    router.replace(pathName, {locale});
  }

  return <Popover setIsOpened={setSettingsOpened} isOpened={isSettingsOpened} trigger={
    <SystemIconButton onClick={() => setSettingsOpened(!isSettingsOpened)} icon="settings"/>
  } placement="bottom-end">
    <div className="rounded-2 border border-primary-border w-[400px] bg-primary-bg">
      {content === "settings"
        ? <DialogHeader variant="dropdown" title={t("settings")} handleClose={() => setSettingsOpened(false)}/>
        : <DialogHeader variant="dropdown" onBack={() => setContent("settings")} title={t("language")}
                        handleClose={() => setSettingsOpened(false)}/>
      }
      {content === "settings"
        ? <div className="p-5">
          <ul className="grid gap-2.5">
            <li
              className="flex items-center justify-between h-[60px] bg-secondary-bg rounded-2 py-3 pr-3 pl-5 duration-200">
              <div className="flex gap-2">
                <div className=""><Svg iconName="night"/></div>
                {t("dark_mode")}
              </div>
              <div>
                <Switch checked={theme === "dark"} setChecked={() => {
                  setTheme(theme === "dark" ? "light" : "dark")
                }}/>
              </div>
            </li>
            <li
              className="flex items-center justify-between h-[60px] bg-secondary-bg rounded-2 py-3 pr-3 pl-5 hover:bg-secondary-hover duration-200 cursor-pointer"
              role="button" onClick={() => {
              setContent("language");
            }}
            >
              <div className="flex gap-2">
                <div className=""><Svg iconName="web3"/></div>
                {t("language")}
              </div>
              <div className={""}><Svg iconName="arrow-right"/></div>
            </li>
            <li
              className="flex items-center justify-between h-[60px] bg-secondary-bg rounded-2 py-3 pr-3 pl-5">
              <div className="flex gap-2">
                <div className=""><Svg iconName="line"/></div>
                {t("show_charts")}
              </div>
              <div>
                <Switch checked={false} setChecked={() => {
                  addToast("Show chart functionality is coming soon", "info");
                }}/>
              </div>
            </li>
            <li
              className="flex items-center justify-between h-[60px] bg-secondary-bg rounded-2 py-3 pr-3 pl-5">
              <div className="flex gap-2">
                <div className=""><Svg iconName="table"/></div>
                {t("show_table")}
              </div>
              <div>
                <Switch checked={false} setChecked={() => {
                  addToast("Show table functionality is coming soon", "info");
                }}/>
              </div>
            </li>
            <li
              className="flex items-center justify-between h-[60px] bg-secondary-bg rounded-2 py-3 pr-3 pl-5">
              <div className="flex gap-2">
                <div className=""><Svg iconName="sound"/></div>
                {t("sounds")}
              </div>
              <div>
                <Switch checked={false} setChecked={() => {
                  addToast("Toggle sounds functionality is coming soon", "info");
                }}/>
              </div>
            </li>
          </ul>
        </div>
        : <div className="p-5 flex flex-col gap-2.5 min-h-[380px]">
          {locales.map((_locale) => {
            return <LangButton key={_locale} onClick={() => {
              redirectedPathName(_locale);
            }} isActive={locale === _locale} label={localesMap[_locale].label} flagURI={localesMap[_locale].img} />
          })}
        </div>
      }
    </div>
  </Popover>
}
