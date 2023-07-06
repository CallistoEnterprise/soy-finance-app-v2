import React, { createRef } from "react";
import styles from "./SelectOptions.module.scss";
import classnames from "clsx";

import SimpleBar from "simplebar-react";
import Portal from "../../atoms/Portal";
import {useCurrentTopPosition} from "../../../shared/hooks/useCurrentTopPosition";

export default function SelectOptions({ isOpen,
  selectedOption,
  onOptionClicked,
  childWidth,
  positions,
  onClose, options }) {
  const optionsRef = createRef<HTMLDivElement>();
  const { currentTopPosition } = useCurrentTopPosition(
    positions,
    optionsRef
  );

  return <Portal isOpen={isOpen} onClose={onClose} root="select-root" isTransitioningClassName={styles.in} className={classnames(
    styles.dialogContainer,
    isOpen && styles.open
  )}>
    <div ref={optionsRef} className={classnames(styles.dropDown)} style={{ width: childWidth,
      top: currentTopPosition,
      left: positions?.left }} role="dialog">
      <div>
        <SimpleBar autoHide={false} style={{ maxHeight: 335 }}>
          <div className={styles.dropDownList}>
            {options.map(option => {
              return (
                <div role="button" key={option.id} className={classnames(
                  styles.listItem,
                  option.id === selectedOption && styles.isActive
                )}
                onClick={onOptionClicked(option.id)}>
                  {option.value}
                </div>
              );
            })}
          </div>
        </SimpleBar>
      </div>
    </div>
    <div className={styles.backdrop} onClick={() => {
      onClose();
    }} />
  </Portal>;
}
