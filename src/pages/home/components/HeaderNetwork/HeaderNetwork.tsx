import React, {useEffect, useMemo, useRef, useState} from "react";
import styles from "./HeaderNetwork.module.scss";
import Button from "../../../../shared/components/Button";
import Image from "next/image";
import clsx from "clsx";
import Svg from "../../../../shared/components/Svg/Svg";
import Portal from "../../../../shared/components/Portal";
import {headersNetworks} from "../../constants/networks";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";

function formatAddress(address: string | null) {
  if(!address) {
    return "";
  }

  return `${address.substring(0,4)}...${address.slice(-4)}`;
}

export default function HeaderNetwork() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isNetworksDropdownOpened, setNetworksDropdownOpened] = useState(false);

  const { chainId, changeNetwork } = useWeb3();

  const [positions, setPositions] = useState({
    top: 0,
    left: 0
  });

  console.log(positions);
  useEffect(
    () => {
      if (ref.current) {
        const currentRef = ref.current as HTMLDivElement;

        setPositions({
          top: currentRef.getBoundingClientRect().y + currentRef.getBoundingClientRect().height + 20,
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
    <Button className={styles.dropdownButton} color="secondary" onClick={() => setNetworksDropdownOpened(true)}>
                <span className={styles.buttonContent}>
                  <Image width={24} height={24} src={currentNetwork.image} alt="Currently picked network"/>
                  <span className={styles.pickedNetworkName}>{currentNetwork.name}</span>
                  <span className={clsx(
                    styles.expandArrow,
                    isNetworksDropdownOpened && styles.opened)
                  }><Svg iconName="expand-arrow"/></span>
                </span>
    </Button>
    <Portal root="dropdown-root" isOpen={isNetworksDropdownOpened} onClose={() => setNetworksDropdownOpened(false)}
            isTransitioningClassName={styles.in} className={clsx(
      styles.dialogContainer,
      isNetworksDropdownOpened && styles.open
    )}>
      <div style={{top: positions.top, left: positions.left}} className={styles.networksDropdown}>
        <nav>
          <ul className={styles.networksList}>
            {headersNetworks.map(n => <li key={n.chainId}>
              <div role="button" onClick={async () => {
                await changeNetwork(n.chainId);
                setNetworksDropdownOpened(false);
              }} className={styles.networkItem}>
                <Image width={24} height={24} src={n.image} alt="Currently picked network"/> {n.name}
              </div>
            </li>)}
          </ul>
        </nav>
      </div>
      <div className={styles.backdrop} onClick={() => {
        setNetworksDropdownOpened(false);
      }}/>
    </Portal>

  </div>
  }</>;
}
