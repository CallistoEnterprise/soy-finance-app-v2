import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";
import Image from "next/image";
import Svg from "@/components/atoms/Svg";
import Preloader from "@/components/atoms/Preloader";
// import AwaitingLoader from "@/components/atoms/AwaitingLoader";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean,
  onClick: any,
  image: string,
  label: string,
  loading?: boolean
}

export default function PickButton({
                                     isActive = false,
                                     loading = false,
                                     image,
                                     label,
                                     ...props
                                   }: PropsWithChildren<Props>) {
  return <button className={clsx(
    "flex flex-col gap-2 justify-center items-center py-4 border hover:border-green rounded-1 w-full duration-200 px-3 ",
    isActive ? "text-font-primary bg-green/20 hover:bg-green/30 border-green" : "text-font-secondary border-primary-border"
  )} {...props}>
    <div className="relative">
      {loading
        ? <Preloader size={32} />
        : <Image src={image} alt={label} width={32} height={32}/>
      }
      {!loading && <span className={clsx(
        "w-5 h-5 absolute text-green flex items-center justify-center -right-1.5 -bottom-[5px] opacity-0 duration-200",
        isActive ? "opacity-100" : "opacity-0"
      )}>
        <span className="absolute bg-primary-bg rounded-full w-[18px] h-[18px]"/>
        <Svg size={19} iconName="done" className="z-10 absolute"/>
      </span>}
    </div>
    <span className="text-12 md:text-14 whitespace-nowrap">{label}</span>
  </button>
}
