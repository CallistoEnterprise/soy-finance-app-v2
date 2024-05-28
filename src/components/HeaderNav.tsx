"use client";
import { IconName } from "@/config/types/IconName";
import { MessageKeys, useTranslations } from "use-intl";
import Svg from "@/components/atoms/Svg";
import { useRouter } from "@/navigation";
import Popover from "@/components/atoms/Popover";
import { useState } from "react";

const menuItems: {
  title: MessageKeys<any, any>;
  url: string;
  menu?: Array<{
    title: string;
    icon: IconName;
    href?: string;
  }>;
}[] = [
  {
    title: "exchange",
    url: "#",
    menu: [
      {
        title: "swap",
        icon: "swap",
        href: "/swap",
      },
      {
        title: "liquidity",
        icon: "liquidity",
        href: "/liquidity",
      },
    ],
  },
  {
    title: "farms",
    url: "/farms",
  },
  {
    title: "bridge",
    url: "https://bridge.soy.finance/",
  },
  {
    title: "v2",
    url: "#",
    menu: [
      {
        title: "lottery",
        icon: "lottery",
        href: "https://app2.soy.finance/lottery",
      },
      {
        title: "staking",
        icon: "staked",
        href: "https://app2.soy.finance/pools",
      },
      {
        title: "info",
        icon: "info",
        href: "https://app2.soy.finance/info",
      },
    ],
  },
  {
    title: "migrate",
    url: "/migrate",
  },
  {
    title: "launchpads",
    url: "/launchpads",
  },
];
function NavItemWithMenu({
  title,
  menu,
  titleId,
}: {
  title: string;
  titleId: string;
  menu: Array<{ title: string; icon: IconName; href?: string }>;
}) {
  const t = useTranslations("Navigation");

  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      isOpened={open}
      setIsOpened={setOpen}
      placement="bottom-start"
      trigger={
        <div
          onClick={() => setOpen(!open)}
          className="px-1.5 text-primary-text font-medium flex items-center gap-1 duration-200 hover:text-green peer"
          role="button"
        >
          {title}
          <Svg className={open ? "-rotate-180" : ""} iconName="arrow-bottom" />
        </div>
      }
    >
      <div className="bg-primary-bg border border-primary-border rounded-2 py-1 top-full absolute peer-hover:opacity-100 peer-hover:visible duration-200 hover:opacity-100 hover:visible after:w-full after:absolute after:h-7 after:bottom-full">
        <nav>
          <ul className="flex flex-col gap-1">
            {menu.map((it) => {
              if (titleId === "v2") {
                return (
                  <a
                    onClick={() => {
                      setOpen(false);
                    }}
                    href={it.href}
                    target="_blank"
                    className="h-10 flex items-center px-4 gap-2 whitespace-nowrap text-primary-text hover:bg-secondary-bg hover:cursor-pointer duration-200"
                    key={it.title}
                  >
                    <Svg iconName={it.icon} />
                    {t(it.title as any)}
                  </a>
                );
              }

              return (
                <li
                  role="button"
                  onClick={() => {
                    if (it.href) {
                      router.push(it.href);
                    }
                    setOpen(false);

                    // showMessage("Coming soon...", "info");
                  }}
                  className="h-10 flex items-center px-4 gap-2 whitespace-nowrap text-primary-text hover:bg-secondary-bg hover:cursor-pointer duration-200"
                  key={it.title}
                >
                  <Svg iconName={it.icon} />
                  {t(it.title as any)}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </Popover>
  );
}
export default function HeaderNav() {
  const t = useTranslations("Navigation");
  const router = useRouter();

  return (
    <nav className="hidden xl:block">
      <ul className="flex items-center gap-2">
        {menuItems.map((link) => (
          <li key={link.title}>
            {link.menu ? (
              <NavItemWithMenu
                menu={link.menu}
                title={t(link.title)}
                titleId={link.title}
              />
            ) : (
              <a
                target=""
                onClick={(e) => {
                  if (
                    link.title === "bridge" ||
                    link.title === "v2" ||
                    link.title === "staking" ||
                    link.title === "lottery"
                  ) {
                    return;
                  }

                  e.preventDefault();

                  if (
                    link.title === "migrate" ||
                    link.title === "launchpads" ||
                    link.title === "farms"
                  ) {
                    router.push(link.url);
                  }

                  // showMessage("Coming soon...", "info");
                }}
                className="px-1.5 font-medium text-primary-text flex items-center gap-1 duration-200 hover:text-green"
                href={link.url}
              >
                {t(link.title)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
