import React, { useState } from "react";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  offset, size,
  useClick,
  useDismiss, useFloating,
  useInteractions, useListNavigation,
  useRole, useTransitionStyles, useTypeahead
} from "@floating-ui/react";
import { flip, shift } from "@floating-ui/core";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";

interface Props {
  value: any,
  setValue: (value: any) => void,
  options: {
    value: any,
    label: any
  }[]
}
export default function Select({value, setValue, options}:Props) {
  const [isOpened, setIsOpened] = useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-start",
    open: isOpened,
    onOpenChange: setIsOpened,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({ padding: 10 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
            minWidth: `${rects.reference.width}px`
          });
        },
        padding: 10
      })
    ]
  });

  const listRef = React.useRef<Array<HTMLElement | null>>([]);
  const listContentRef = React.useRef(options.map((o) => o.label));
  const isTypingRef = React.useRef(false);

  const click = useClick(context, { event: "mousedown" });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    // This is a large list, allow looping.
    loop: true
  });
  const typeahead = useTypeahead(context, {
    listRef: listContentRef,
    activeIndex,
    selectedIndex,
    onMatch: isOpened ? setActiveIndex : setSelectedIndex,
    onTypingChange(isTyping) {
      isTypingRef.current = isTyping;
    }
  });

  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps
  } = useInteractions([dismiss, role, listNav, typeahead, click]);

  const handleSelect = (value: any) => {
    setValue(value);
    setIsOpened(false);
    setSelectedIndex(options.findIndex(i => i.value === value))
  };

  const selectedItemLabel = options.find((o) => o.value === value)?.label || undefined;

  const {isMounted, styles: transitionStyles} = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: 200
    },
  });


  return (
    <>
      <div
        tabIndex={0}
        ref={refs.setReference}
        aria-labelledby="select-label"
        aria-autocomplete="none"
        className="cursor-pointer h-10 rounded-2 min-w-[160px] flex items-center justify-between pl-4 pr-2.5 bg-secondary-bg hover:bg-secondary-hover duration-200"
        {...getReferenceProps()}
      >
        {selectedItemLabel || "Select..."}
        <Svg className={clsx("duration-200", isOpened ? "-rotate-180" : "rotate-0")} iconName="arrow-bottom" />
      </div>
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                ...transitionStyles
              }}
              className="rounded-2 border border-primary-border bg-primary-bg flex flex-col gap-1 py-2"
              {...getFloatingProps()}
            >
              {options.map(({ value: internalValue, label }, i) => (
                <div
                  key={internalValue}
                  ref={(node) => {
                    listRef.current[i] = node;
                  }}
                  role="option"
                  tabIndex={i === activeIndex ? 0 : -1}
                  aria-selected={i === selectedIndex && i === activeIndex}
                  className={clsx(
                    i === activeIndex && i !== selectedIndex ? "bg-secondary-bg" : "",
                    i === selectedIndex && "text-green",
                    "px-2 py-2 cursor-pointer"
                  )}
                  {...getItemProps({
                    // Handle pointer select.
                    onClick() {
                      handleSelect(internalValue);
                    },
                    // Handle keyboard select.
                    onKeyDown(event) {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSelect(internalValue);
                      }

                      if (event.key === " " && !isTypingRef.current) {
                        event.preventDefault();
                        handleSelect(internalValue);
                      }
                    }
                  })}
                >
                  {label}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      right: 10
                    }}
                  >
                    {i === selectedIndex ? " ✓" : ""}
                  </span>
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
