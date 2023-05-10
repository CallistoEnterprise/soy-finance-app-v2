import React, { createRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import useMountTransition from "../../../shared/hooks/useMountTransition";
import {useScrollBlockingOnOpen} from "../../../shared/hooks/useScrollBlockingOnOpen";
import {useCloseWithEscape} from "../../../shared/hooks/useCloseWithEscape";
import {montserrat} from "../../../shared/fonts";

interface Props {
  root: string,
  isOpen: boolean | null,
  removeWhenClosed?: boolean,
  children: any,
  onClose: any,
  className?: string | null,
  isTransitioningClassName?: string
}

export default function Portal({ root, isOpen, children, onClose, removeWhenClosed = true, className = null, isTransitioningClassName }: Props) {
  const ref = createRef<HTMLDivElement>();
  const isTransitioning = useMountTransition(
    isOpen,
    300
  );

  useScrollBlockingOnOpen(isOpen);

  useCloseWithEscape(
    isOpen,
    onClose
  );

  if (!isTransitioning && removeWhenClosed && !isOpen) {
    return null;
  }

  return createPortal(
    <div ref={ref}
      aria-hidden={isOpen
        ? "false"
        : "true"}
      className={clsx(
        className,
        isTransitioning && isTransitioningClassName,
        montserrat.className
      )}
    >
      {children}
    </div>,
    document.getElementById(root)!
  );
}
