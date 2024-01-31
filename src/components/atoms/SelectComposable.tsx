import {
  autoUpdate,
  useFloating,
  flip,
  useListNavigation,
  useTypeahead,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager, FloatingList, useListItem, useTransitionStyles
} from "@floating-ui/react";
import { ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Svg from "@/components/atoms/Svg";

interface SelectContextValue {
  activeIndex: number | null;
  selectedIndex: number | null;
  getItemProps: ReturnType<typeof useInteractions>["getItemProps"];
  handleSelect: (index: number | null, value: string) => void;
}

const SelectContext = createContext<SelectContextValue>(
  {} as SelectContextValue
);

export function SelectComposable({value, setValue, children }: { value: string | null, setValue: (value: string | null) => void, children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-start",
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [flip()]
  });

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const handleSelect = useCallback((index: number | null, value: string) => {
    setSelectedIndex(index);
    setIsOpen(false);
    if (index !== null) {
      setSelectedLabel(labelsRef.current[index]);
      setValue(value);
    }
  }, [setValue]);

  function handleTypeaheadMatch(index: number | null) {
    if (isOpen) {
      setActiveIndex(index);
    } else {
      setSelectedIndex(index);
    }
  }

  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch: handleTypeaheadMatch
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });

  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps
  } = useInteractions([listNav, typeahead, click, dismiss, role]);

  const selectContext = useMemo(
    () => ({
      activeIndex,
      selectedIndex,
      getItemProps,
      handleSelect
    }),
    [activeIndex, selectedIndex, getItemProps, handleSelect]
  );

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: 200
    },
  });

  return (
    <>
      <div className="w-full flex items-center justify-between border border-primary-border rounded-2 py-[7px] pl-5 pr-4 cursor-pointer" ref={refs.setReference} tabIndex={0} {...getReferenceProps()}>
        {selectedLabel ?? "Select..."}
        <Svg iconName="arrow-bottom" />
      </div>
      <SelectContext.Provider value={selectContext}>
        {isMounted && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, ...transitionStyles }}
              className="flex flex-col py-1 bg-primary-bg border border-primary-border"
              {...getFloatingProps()}
            >
              <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                {children}
              </FloatingList>
            </div>
          </FloatingFocusManager>
        )}
      </SelectContext.Provider>
    </>
  );
}

export function Option({ label, value }: { label: string, value: string }) {
  const {
    activeIndex,
    selectedIndex,
    getItemProps,
    handleSelect
  } = useContext(SelectContext);

  const { ref, index } = useListItem({ label });

  const isActive = activeIndex === index;
  const isSelected = selectedIndex === index;

  return (
    <button
      ref={ref}
      role="option"
      aria-selected={isActive && isSelected}
      tabIndex={isActive ? 0 : -1}
      style={{
        background: isActive ? "cyan" : "",
        fontWeight: isSelected ? "bold" : ""
      }}
      {...getItemProps({
        onClick: () => handleSelect(index, value)
      })}
    >
      {label}
    </button>
  );
}
