import { useMemo, useState } from "react";
import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/buttons/SelectButton";
import { useAccount, useDisconnect } from "wagmi";
import Svg from "@/components/atoms/Svg";
import DropdownItem from "@/components/DropdownItem";
import WalletDialog from "@/components/dialogs/WalletDialog";
import { useWalletDialogStore } from "@/components/dialogs/stores/useWalletDialogStore";
import Preloader from "@/components/atoms/Preloader";
import { RecentTransaction } from "@/stores/useRecentTransactions";
import { useTranslations } from "use-intl";

interface Props {
  pending: RecentTransaction[] | undefined
}
export default function WalletMenu({pending}: Props) {
  const t = useTranslations("SettingsAndWallet");

  const [isWalletMenuOpened, setWalletMenuOpened] = useState(false);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const {setActiveTab, setIsOpen: setWalletDialogOpened} = useWalletDialogStore();

  return <>
    <Popover isOpened={isWalletMenuOpened} setIsOpened={setWalletMenuOpened} placement="bottom-end" trigger={
      <SelectButton onClick={() => setWalletMenuOpened(!isWalletMenuOpened)} isOpened={isWalletMenuOpened}>
      <span className="flex gap-2 items-center">
        <Svg className="text-secondary-text" iconName="wallet"/>
        {`${address?.substring(0, 4)}...${address?.slice(-4)}`}
      </span>
        {pending && pending.length ? <div className="w-6 h-6 absolute -right-2 -top-2 rounded-full bg-primary-bg border border-primary-border flex justify-center items-center">
          <Preloader size={20} />
          <span className="text-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {pending.length}
          </span>
        </div> : null}
      </SelectButton>
    }>
      <div className="bg-primary-bg border border-primary-border rounded-2 py-1 z-[1000]">
        <nav>
          <ul className="flex flex-col gap-1">
            <li>
              <DropdownItem handleClick={() => {
                setActiveTab(0);
                setWalletDialogOpened(true);
                setWalletMenuOpened(false);
                // setWalletDialogOpenedFn(true);
                // setDefaultTab(0);
              }} label={t("wallet")} image={<Svg className="text-secondary-text" iconName="wallet"/>}
              />
            </li>
            <li>
              <DropdownItem handleClick={() => {
                setActiveTab(1);
                setWalletDialogOpened(true);
                setWalletMenuOpened(false);
                // setWalletDialogOpenedFn(true);
                // setDefaultTab(1);
              }} label={t("recent_transactions")} notify={Boolean(pending?.length)} image={<Svg className="text-secondary-text" iconName="history"/>}
              />
            </li>
            <div className="w-full h-[1px] bg-primary-border"/>
            <li>
              <DropdownItem handleClick={() => {
                disconnect();
                setWalletMenuOpened(false);
              }} label={t("disconnect")} image={<Svg className="text-secondary-text" iconName="logout"/>}
              />
            </li>
          </ul>
        </nav>
      </div>
    </Popover>
    <WalletDialog />
  </>
}
