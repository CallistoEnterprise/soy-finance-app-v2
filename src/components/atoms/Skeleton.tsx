import { HTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends HTMLAttributes<HTMLDivElement> {
  white?: boolean
}
export default function Skeleton({className, white = false, ...props}: Props) {
  return <div className={clsx(
    "rounded-1 w-[70px] h-4 my-[5px]",
    white ? "bg-secondary-hover" : "bg-secondary-hover"
  )} />
}
