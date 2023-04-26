import React from "react";
import {IconName} from "./svgIconsMap";

interface Props {
  iconName: IconName,
  size?: number,
  style?: React.CSSProperties,
  [key: string]: any
}

export default function Svg({ iconName, size = 24, style, ...rest }: Props) {
  return <svg style={{
    width: size,
    height: size,
    ...style
  }} {...rest}>
    <use xlinkHref={`/sprite.svg#${iconName}`} />
  </svg>;
}
