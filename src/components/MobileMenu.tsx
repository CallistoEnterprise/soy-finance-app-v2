import Drawer from "@/components/atoms/Drawer";
import { Link } from "@/navigation";
import Svg from "@/components/atoms/Svg";
import { socialLinks } from "@/components/Footer";
import SocialIconButton from "@/components/buttons/SocialIconLink";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import { useState } from "react";
import addToast from "@/other/toast";

export default function MobileMenu() {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);

  return (
    <div className="xl:hidden">
      <Drawer
        placement="left"
        isOpen={mobileMenuOpened}
        setIsOpen={setMobileMenuOpened}
      >
        <div className="py-6 px-4 grid gap-6">
          <div>
            <h3 className="mb-2 text-12 text-secondary-text -tracking-[0.24px]">
              Exchange
            </h3>
            <div className="grid gap-1">
              <Link
                onClick={() => {
                  setMobileMenuOpened(false);
                }}
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="/swap"
              >
                <Svg iconName="swap" />
                Swap
              </Link>
              <Link
                onClick={() => {
                  setMobileMenuOpened(false);
                }}
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="/liquidity"
              >
                <Svg iconName="liquidity" />
                Liquidity
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-12 text-secondary-text -tracking-[0.24px]">
              Farming
            </h3>
            <div className="grid gap-1">
              <Link
                onClick={() => {
                  setMobileMenuOpened(false);
                }}
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="/farms"
              >
                <Svg iconName="farm" />
                Farms
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-12 text-secondary-text -tracking-[0.24px]">
              Soy Finance V2
            </h3>
            <div className="grid gap-1">
              <a
                target="_blank"
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="https://app2.soy.finance/pools"
              >
                <Svg iconName="staked" />
                Staking
              </a>
              <a
                target="_blank"
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="https://app2.soy.finance/lottery"
              >
                <Svg iconName="lottery" />
                Lottery
              </a>
              <a
                target="_blank"
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="https://app2.soy.finance/info"
              >
                <Svg iconName="info" />
                Info
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-12 text-secondary-text -tracking-[0.24px]">
              More
            </h3>
            <div className="grid gap-1">
              <a
                onClick={() => {
                  setMobileMenuOpened(false);
                }}
                target="_blank"
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="https://bridge.soy.finance/"
              >
                <Svg iconName="bridge" />
                Bridge
              </a>
              <Link
                onClick={() => {
                  setMobileMenuOpened(false);
                }}
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="/migrate"
              >
                <Svg iconName="migrate" />
                Migrate
              </Link>
              <Link
                onClick={() => {
                  setMobileMenuOpened(false);
                }}
                className="flex items-center gap-2 text-secondary-text w-full pl-2 h-10"
                href="/launchpads"
              >
                <Svg iconName="boost" />
                Launchpads
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-12 text-secondary-text -tracking-[0.24px]">
              Social media
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap">
              {socialLinks.map((item, index) => {
                return (
                  <a key={item.icon} target="_blank" href={item.link}>
                    <SocialIconButton icon={item.icon} key={index} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </Drawer>
      <ActionIconButton icon="menu" onClick={() => setMobileMenuOpened(true)} />
    </div>
  );
}
