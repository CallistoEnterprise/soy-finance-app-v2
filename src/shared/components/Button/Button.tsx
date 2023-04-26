import React, {ButtonHTMLAttributes, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import styles from "./Button.module.scss";
import Preloader from "../Preloader/Preloader";
import Svg from "../Svg/Svg";
import {IconName} from "../Svg/svgIconsMap";
import {useDebounce} from "../../hooks/useDebounce";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: any,
  variant?: "text" | "outlined" | "contained" | "popup",
  className?: string,
  onClick?: any,
  size?: "small" | "medium" | "large",
  loading?: boolean,
  startIcon?: IconName,
  endIcon?: IconName,
  fullWidth?:boolean,
  mode?: "default" | "error"
}

function Ripple({top, left, size}) {
  return <div style={{top, left, width: size, height: size}} className={styles.ripple} />
}

export default function Button({
  children,
  variant = "contained",
  size = "medium",
  className = "",
  onClick = null,
  loading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  mode = "default",
  ...props
}: Props) {
  const ref = useRef<HTMLButtonElement>();
  const [ripples, setRipples] = useState([]);

  const _debounced = useDebounce(ripples, 5000);
  useEffect(() => {
    if (_debounced.length) {
      setRipples([]);
    }
  }, [_debounced.length]);

  return <button ref={ref} className={
    clsx(
      styles[variant],
      styles[size],
      styles[mode],
      loading && styles.loading,
      endIcon && styles.endIcon,
      startIcon && styles.startIcon,
      fullWidth && styles.fullWidth,
      className
    )
  } onClick={e => {
    const elem = ref.current;

    if(elem) {
      const rect = elem.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;
      const height = elem.clientHeight;
      const width = elem.clientWidth;
      const diameter = Math.max(width, height);
      setRipples([...ripples, <Ripple key={ripples.length} top={top - diameter / 2} left={left - diameter / 2} size={Math.max(width, height)}/>]);
    }


    onClick && onClick(e);
  }} {...props}>
    <div>{ripples.map((r, index) => <React.Fragment key={index}>{r}</React.Fragment>)}</div>

    <span className={styles.content}>
      {startIcon && <Svg iconName={startIcon} />}
        {children}
      {endIcon && <Svg iconName={endIcon} />}
    </span>


    {loading && <span className={styles.preloader}>
      <Preloader type="linear" color={variant === "outlined" ? "green" : "white"} />
    </span>}
  </button>;
};

