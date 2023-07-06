import React, {AnchorHTMLAttributes} from "react";
import styles from "./ExternalLink.module.scss";
import Svg from "../Svg";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement>{
  href: string,
  text: string
}

export default function ExternalLink({href, text, ...props}: Props) {
  return <a target="_blank" className={styles.externalLink} href={href} {...props}>
    <span>{text}</span>
    <Svg size={20} iconName="arrow-popup" />
  </a>;
}
