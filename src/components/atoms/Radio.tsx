import React, { PropsWithChildren, ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  isActive: boolean,
  onClick: () => void
}

export default function Radio({ isActive, children, onClick, ...props }: PropsWithChildren<Props>) {
  return <button {...props} 
    className={clsx("duration-200 border h-10 flex justify-between px-5 items-center rounded-2 group hover:border-green",
      isActive ? "border-green" : "border-active-border"
    )} onClick={onClick}>
    <span>{children}</span>
    <span
      className={clsx("duration-200 w-6 h-6 rounded-full border flex items-center justify-center group-hover:border-green", isActive ? "border-green" : "border-active-border")}>
                  <span
                    className={clsx("duration-200 w-3 h-3 rounded-full bg-green", isActive ? "opacity-100" : "opacity-0")}/>
                </span>
  </button>
}
