"use client";
import React from "react";
import PageCard from "@/components/PageCard";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import clsx from "clsx";
import { useTheme } from "next-themes";
import Image from "next/image";
import { WrappedToken } from "@/config/types/WrappedToken";
import {useTranslations} from "use-intl";
function Progress({percents, color}: {percents: number, color: "green" | "purple" | "pink"}) {
  return <>
    <div className="relative w-full h-2.5 rounded-5 overflow-hidden bg-secondary-bg">
      <div className={clsx(
        "absolute top-0 bottom-0 left-0",
        color === "green" && "bg-green",
        color === "purple" && "bg-violet",
        color === "pink" && "bg-pink"
      )} style={{width: `${percents}%`}} />
    </div>
    <div className="flex justify-between mt-1 items-center">
      {[...Array(10)].map((item, index) =>{
        return <React.Fragment key={index}>
          <span className="font-secondary font-14">
            {index  + 1}
          </span>
        </React.Fragment>
      })}
    </div>
  </>
}

function SemiCircleProgress({percentage, logoURI}: {percentage: number, logoURI: string}) {
  const angle = (percentage / 100) * 180 * Math.PI / 180;
  const XEnd = 160 + Math.abs(150 * Math.cos(angle));
  const YEnd = 160 - Math.abs(150 * Math.sin(angle)) - 5;

  const {theme} = useTheme();
  const t = useTranslations("Swap");

  return <div className="relative overflow-hidden flex justify-center">
    <svg width="320" height="160" viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" className="stroke-secondary-bg dark:stroke-primary-bg-dark" strokeWidth="10" fill="transparent" d="M10,155 A 150 150 0 0 1 310 155" />
      <path strokeLinecap="round" stroke={theme === "dark" ? "#7CB819" : "#6DA316" } strokeWidth="10" fill="transparent" d={`M10,155 A 150 150 0 0 1 ${XEnd} ${YEnd}`} />
    </svg>
    <div className="absolute rounded-full my-0 mx-auto flex items-center flex-col justify-start top-[30px] w-[260px] h-[130px] pt-6">
      <div className="absolute top-0 text-primary-border">
        <svg width="263" height="132" viewBox="0 0 263 132" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M261.5 131C261.5 96.5219 247.804 63.4559 223.424 39.0761C199.044 14.6964 165.978 1 131.5 1C97.0219 0.999997 63.9559 14.6964 39.5761 39.0761C15.1964 63.4558 1.50001 96.5218 1.5 131" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeDasharray="2 20"/>
        </svg>
      </div>
      <Image className="mb-2.5" src={logoURI} alt={""} width={40} height={40} />
      <span className="text-20 font-bold text-green">{percentage / 10} / 10</span>
      <span className="font-secondary font-16 ">{t("overall_score")}</span>
    </div>
  </div>

}

export default function SafeTrading({ token, meta }: {token: WrappedToken, meta: {score: number, link: string}})  {
  const t = useTranslations("Swap");

  return <PageCard>
    <h2 className="text-24 font-bold">{t("safe_trading")}</h2>
    <div className="mb-4" />
    <SemiCircleProgress logoURI={token.logoURI} percentage={meta.score * 10} />
    <div className="mb-4" />
    <p>{t("security_audit_score")}</p>
    <div className="mb-2.5" />
    <Progress percents={meta.score * 10} color="green" />
    <div className="flex justify-center mt-5">
      <a target="_blank" href={meta.link}>
        <PrimaryButton variant="outlined">{t("learn_more")}</PrimaryButton>
      </a>
    </div>
  </PageCard>;
}
