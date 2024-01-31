import { AnchorHTMLAttributes } from "react";
import Svg from "@/components/atoms/Svg";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement>{
  href: string,
  text: string
}
export default function ExternalLink({href, text, ...props}: Props) {
  return <a target="_blank" className="text-16 text-green inline-flex items-center gap-1 relative after:absolute after:left-0 after:w-0 after:h-[1px] after:block after:bg-green after:bottom-0 after:duration-300 hover:after:w-full" href={href} {...props}>
    <span>{text}</span>
    <Svg size={20} iconName="arrow-popup" />
  </a>
}
