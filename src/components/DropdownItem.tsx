import { ReactNode } from "react";
import clsx from "clsx";
import Image from "next/image";

interface Props {
  handleClick: () => any,
  isActive?: boolean,
  label: string,
  image?: string | ReactNode,
  notify?: boolean
}
export default function DropdownItem({handleClick, isActive = false, label, image, notify = false}: Props) {
  return  <div role="button" onClick={handleClick} className={clsx(
    "flex items-center py-2 px-4 gap-2 whitespace-nowrap hover:bg-secondary-bg cursor-pointer duration-200",
    isActive ? "text-green-saturated" : "text-primary-text"
  )}>
    {image && <span className="w-6 h-6 relative">
      {notify && <span className="absolute w-2 h-2 rounded-full bg-red border border-primary-bg right-[1px] top-[1px]" />}
      {typeof image === "string"
        ? <Image width={24} height={24} src={image} alt="Currently picked network"/>
        : image
      }
    </span>}
    {label}
  </div>;
}
