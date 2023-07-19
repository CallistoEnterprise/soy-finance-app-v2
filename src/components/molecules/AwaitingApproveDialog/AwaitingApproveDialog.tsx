import React, {useCallback, useMemo} from "react";
import styles from "./AwaitingApproveDialog.module.scss";
import {useAwaitingApproveDialog} from "../../../stores/awaiting-approve-dialog/useAwaitingApproveDialog";
import DrawerDialog from "../../atoms/DrawerDialog";
import {wallets} from "../../../processes/web3/constants/wallets";
import Preloader from "../../atoms/Preloader";
import Image from "next/image";
import Text from "../../atoms/Text";
import Svg from "../../atoms/Svg";
import ExternalLink from "../../atoms/ExternalLink";
import Button from "../../atoms/Button";
import {ChainId} from "@callisto-enterprise/soy-sdk";
import DialogCloseButton from "../../atoms/DialogCloseButton";

const CHAINS_CONSTANTS = {
  [ChainId.MAINNET]: {
    explorer: {
      name: 'CallistoScan',
      url: 'https://explorer.callisto.network',
    }
  },
  [ChainId.BTTMAINNET]: {
    explorer: {
      name: 'BttcScan',
      url: 'https://bttcscan.com/',
    },
  },
  [ChainId.ETCCLASSICMAINNET]: {
    explorer: {
      name: 'ETCScan',
      url: 'https://blockscout.com/etc/mainnet/',
    }
  }
}

export function getExpLink(
  data: string | number,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainId: ChainId = ChainId.MAINNET,
): string {
  switch (type) {
    case 'transaction': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/tx/${data}/token-transfers`
    }
    case 'token': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/address/${data}/transactions`
    }
    case 'block': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/${data}`
    }
    case 'countdown': {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/${data}`
    }
    default: {
      return `${CHAINS_CONSTANTS[chainId].explorer.url}/address/${data}/transactions`
    }
  }
}

export default function AwaitingApproveDialog() {
  const {awaitingApproveDialogInfo, isAwaitingApproveDialogOpened, handleClose, submitted, submittedInfo} = useAwaitingApproveDialog();

  const chainRelatedSubmittedInfo = useMemo((): {url: string, title: string} => {
    return {
      url: getExpLink(submittedInfo.hash, submittedInfo.operation, submittedInfo.chainId),
      title: `View on ${CHAINS_CONSTANTS[submittedInfo.chainId].explorer.name}`
    }
  }, [submittedInfo.chainId, submittedInfo.hash, submittedInfo.operation]);

  return <DrawerDialog isOpen={isAwaitingApproveDialogOpened} onClose={handleClose}>
    <DialogCloseButton handleClose={handleClose} />
    <div className={styles.awaitingApproveDialog}>
      {!submitted ?
        <>
          <Image width={100} height={100} src={wallets[awaitingApproveDialogInfo.wallet].image} alt=""/>
          <Preloader type="linear" />
          <div className={styles.text}>
            <Text variant={24} weight={700}>Waiting for confirmation</Text>
            <Text color="secondary">{awaitingApproveDialogInfo.subheading}</Text>
          </div>
        </>
     : <>
          <div className={styles.checkMark}>
            <div className={styles.checkMarkInner}>
              <Svg iconName="check" size={60} />
            </div>
          </div>
          <div className={styles.text}>
            <Text variant={24} weight={700}>Transaction submitted</Text>
            <ExternalLink href={chainRelatedSubmittedInfo.url} text={chainRelatedSubmittedInfo.title} />
          </div>
          <Button onClick={handleClose} fullWidth>Great!</Button>
        </>}
    </div>
  </DrawerDialog>;
}
