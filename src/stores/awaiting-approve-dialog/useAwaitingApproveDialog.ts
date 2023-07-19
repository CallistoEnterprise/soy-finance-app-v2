import {useEvent, useStore} from "effector-react";
import {
  $awaitingApproveDialogInfo, $awaitingApproveDialogSubmittedInfo,
  $isAwaitingApproveDialogOpened, $isAwaitingDialogSubmitted, setApproveDialogSubmittedInfo,
  setAwaitingApproveDialogInfo,
  setAwaitingApproveDialogOpened, setAwaitingDialogSubmitted
} from "./stores";
import {useCallback} from "react";

export function useAwaitingApproveDialog() {
  const isOpened = useStore($isAwaitingApproveDialogOpened);
  const setIsOpened = useEvent(setAwaitingApproveDialogOpened);

  const info = useStore($awaitingApproveDialogInfo);
  const setInfo = useEvent(setAwaitingApproveDialogInfo);

  const submitted = useStore($isAwaitingDialogSubmitted);
  const setSubmitted = useEvent(setAwaitingDialogSubmitted);

  const submittedInfo = useStore($awaitingApproveDialogSubmittedInfo);
  const setSubmittedInfo = useEvent(setApproveDialogSubmittedInfo);

  const handleOpen = useCallback(() => {
    setIsOpened(true);
  }, [setIsOpened]);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, [setIsOpened]);

  return {
    awaitingApproveDialogInfo: info,
    setAwaitingApproveDialogInfo: setInfo,
    isAwaitingApproveDialogOpened: isOpened,
    handleClose,
    handleOpen,
    submitted,
    setSubmitted,
    submittedInfo,
    setSubmittedInfo
  }
}
