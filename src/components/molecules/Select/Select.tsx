import React, { useEffect, useRef, useState } from "react";
import styles from "./Select.module.scss";
import classnames from "clsx";
import SelectOptions from "../SelectOptions";
import Svg from "../../atoms/Svg/Svg";

interface Props {
  options: Array<{
    value: any,
    id: any
  }>,
  selectedOption: string,
  setSelectedOption: any,
  label?: string,
  width?: any,
  containerStyles?: any,
  placeholder?: string,
  isLoading?: boolean,
  readOnly?: boolean
}

export default function Select({ options, selectedOption, setSelectedOption, label, width, containerStyles = {}, isLoading, placeholder, readOnly = false }: Props) {
  const ref = useRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = useState(false);

  const [childWidth, setChildWidth] = useState(null);

  const [positions, setPositions] = useState<any>(null);
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(
    () => {
      const onKeyPress = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        window.addEventListener(
          "keyup",
          onKeyPress
        );
      }

      return () => {
        window.removeEventListener(
          "keyup",
          onKeyPress
        );
      };
    },
    [isOpen]
  );

  const onOptionClicked = value => () => {
    setSelectedOption(value);
    setIsOpen(false);
  };

  useEffect(
    () => {
      const checkIfClickedOutside = e => {
        if (isOpen && ref.current && !ref.current?.contains(e.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener(
        "click",
        checkIfClickedOutside
      );

      return () => {
        document.removeEventListener(
          "click",
          checkIfClickedOutside
        );
      };
    },
    [isOpen]
  );

  useEffect(
    () => {
      if (ref.current) {
        setChildWidth(ref.current?.getBoundingClientRect().width);

        setPositions({
          top: ref.current?.getBoundingClientRect().y + ref.current?.getBoundingClientRect().height + 10,
          left: ref.current?.getBoundingClientRect().left
        });
      }
    },
    [ref, isOpen]
  );

  return <div className={styles.upperContainer}>
    {label && <div className={styles.selectLabel}>
      {label}
    </div>}
    <div className={styles.dropDownContainer} style={{ width }} ref={ref}>
      <div className={classnames(
        styles.dropDownHeader,
        isOpen && styles.isOpen,
        // readOnly && styles.readonly
      )} style={containerStyles} onClick={() => {
        if (!readOnly) {
          toggleOpen();
        }
      }}>
        {options.find((option) => option.id === selectedOption)?.value || <span className={styles.placeholder}>{placeholder}</span>}
        {!readOnly && <div className={classnames(
          styles.expandIconWrapper,
          isOpen && styles.isOpen
        )}>
          <Svg iconName="arrow-bottom" />
        </div>}
      </div>
      {!readOnly &&
        <SelectOptions
          options={options}
          selectedOption={selectedOption}
          onClose={() => setIsOpen(false)}
          isOpen={isOpen}
          onOptionClicked={onOptionClicked}
          childWidth={childWidth}
          positions={positions}
        />
      }
    </div>
  </div>;
}
