"use client";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import Image from "next/image";
import { wallets } from "@/config/wallets";
import Preloader from "@/components/atoms/Preloader";
import ExternalLink from "@/components/atoms/ExternalLink";
import Svg from "@/components/atoms/Svg";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import CloseIconButton from "@/components/buttons/CloseIconButton";
import { ChainId } from "@callisto-enterprise/soy-sdk";
import { getExpLink } from "@/components/RecentTransaction";
import { useTranslations } from "use-intl";


export default function AwaitingDialog() {
  const t = useTranslations("Confirmation");

  const { label, isOpened, toggleOpened, isSubmitted, setClose, hash, chainId } = useAwaitingDialogStore();

  return <DrawerDialog isOpen={isOpened} setIsOpen={toggleOpened}>
    <div className="p-10 flex flex-col items-center justify-center relative">
      {!isSubmitted ?
        <>
          <div className="flex justify-center">
            <Image src={wallets.metamask.image} alt={label} width={100} height={100}/>
          </div>
          <div className="mt-5 mb-5 flex justify-center">
            <Preloader type="linear"/>
          </div>
          <h2 className="text-24 text-center mb-1">{t("waiting_for_confirmation")}</h2>
          <p className="text-secondary-text text-16 text-center">{label}</p>
        </> : <>
          <div className="absolute right-3 top-3">
            <CloseIconButton handleClose={setClose} />
          </div>
          <div className="rounded-full flex items-center justify-center w-[110px] h-[110px] bg-green/20 mb-5">
            <div className="rounded-full flex items-center justify-center bg-green text-white w-[80px] h-[80px]">
              <Svg iconName="check" size={60}/>
            </div>
          </div>
          <div className="flex gap-1 flex-col justify-center items-center mb-5 w-full xl:w-[400px]">
            <p className="text-24 mb-2.5">{t("transaction_submitted")}</p>
            <ExternalLink href={getExpLink(hash!, "transaction", chainId && [820, 199, 61].includes(chainId) ? chainId as 820 | 199 | 61 : 820)} text={t("view_on_explorer")}/>
          </div>
          <PrimaryButton onClick={setClose} fullWidth>{t("great")}</PrimaryButton>
        </>}
    </div>
  </DrawerDialog>
}
