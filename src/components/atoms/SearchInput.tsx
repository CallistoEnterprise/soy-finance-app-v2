import { ChangeEvent, InputHTMLAttributes } from "react";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  large?: boolean
}
export default function SearchInput({large = false, ...props }: Props) {
  return <div className="relative">
    <input {...props}
          className={clsx("pr-12 hover:border-green bg-secondary-bg duration-200  border-primary-border border focus:border-green outline-0 px-4 rounded-2 w-full", large ? "h-[52px]" : " h-10")}
           // className="rounded-2 border border-primary-border   text-primary-text duration-200 outline-0 hover:bg-secondary-hover focus:border-green active:border-green focus:bg-secondary-bg focus:bg-secondary-bg"
    />
    <Svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" iconName="search" />
  </div>
}
