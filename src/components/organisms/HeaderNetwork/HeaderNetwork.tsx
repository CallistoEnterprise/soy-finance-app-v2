import React, {useEffect, useMemo, useRef, useState} from "react";
import styles from "./HeaderNetwork.module.scss";
import clsx from "clsx";
import Portal from "../../atoms/Portal";
import {headersNetworks} from "../../../pages/swap/constants/networks";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useStore} from "effector-react";
import {$wc2blockchains} from "../../../processes/web3/models/stores";
import ConfirmationPopup from "../ConfirmationPopup";
import OpenDropdownButton from "../../molecules/OpenDropdownButton";
import DropdownItem from "../../molecules/DropdownItem";

interface Props {
  expandDirection?: "bottom" | "top"
}

export default function HeaderNetwork({expandDirection = "bottom"}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isNetworksDropdownOpened, setNetworksDropdownOpened] = useState(false);

  const networks = useStore($wc2blockchains);

  const { chainId, changeNetwork, isChangingNetwork } = useWeb3();

  const [positions, setPositions] = useState({
    [expandDirection === "bottom" ? "top" : "bottom"]: 0,
    left: 0
  });

  useEffect(
    () => {
      if (ref.current) {
        const currentRef = ref.current as HTMLDivElement;

        setPositions({
          [expandDirection === "bottom" ? "top" : "bottom"]: expandDirection === "bottom"
            ? currentRef.getBoundingClientRect().y + currentRef.getBoundingClientRect().height + 20
            : currentRef.getBoundingClientRect().height + 20,
          left: currentRef.getBoundingClientRect().left
        });
      }
    },
    [ref, isNetworksDropdownOpened]
  );

  const currentNetwork = useMemo(() => {
    const foundById = headersNetworks.find(n => n.chainId === chainId);

    if(!foundById) {
      return null;
    }

    return foundById;
  }, [chainId]);

  return <>{currentNetwork &&
  <div ref={ref} className={styles.dropdownWrapper}>
    <OpenDropdownButton
      handleClick={() => setNetworksDropdownOpened(true)}
      label={currentNetwork.name}
      isOpened={isNetworksDropdownOpened}
      img={currentNetwork.image}
    />

    <Portal root="dropdown-root" isOpen={isNetworksDropdownOpened} onClose={() => setNetworksDropdownOpened(false)}
            isTransitioningClassName={styles.in} className={clsx(
      styles.dialogContainer,
      isNetworksDropdownOpened && styles.open
    )}>
      <div style={{top: positions.top, left: positions.left, bottom: positions.bottom}} className={styles.networksDropdown}>
        <nav>
          <ul className={styles.networksList}>
            {headersNetworks.filter(n => networks.includes(n.chainId)).map(n => <li key={n.chainId}>
              <DropdownItem handleClick={async () => {
                changeNetwork(n.chainId);
                setNetworksDropdownOpened(false);
              }} label={n.name} image={n.image} isActive={n.chainId === chainId} />
            </li>)}
          </ul>
        </nav>
      </div>
      <div className={styles.backdrop} onClick={() => {
        setNetworksDropdownOpened(false);
      }}/>
    </Portal>
    <ConfirmationPopup open={isChangingNetwork} details="Awaiting network change" />
  </div>
  }</>;
}
