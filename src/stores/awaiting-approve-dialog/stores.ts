import {createEvent, createStore} from "effector";
import {ChainId} from "@callisto-enterprise/soy-sdk";

export type AwaitingDialogInfo = {
  subheading: string,
  wallet: "metamask" | "walletConnect"
}

export type SubmittedDialogInfo = {
  hash: string,
  operation: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainId: ChainId
}

export const $isAwaitingApproveDialogOpened = createStore<boolean>(false, {sid: "isAwaitingApproveDialogOpened"});
export const $awaitingApproveDialogInfo = createStore<AwaitingDialogInfo>({ subheading: "", wallet: "metamask" }, {sid: "awaitingApproveDialogInfo"});
export const $isAwaitingDialogSubmitted = createStore<boolean>(false, {sid: "isAwaitingDialogSubmitted"});
export const $awaitingApproveDialogSubmittedInfo = createStore<SubmittedDialogInfo>({
  hash: "",
  operation: "transaction",
  chainId: ChainId.MAINNET
}, {sid: "isAwaitingDialogSubmitted"});

export const setAwaitingApproveDialogOpened = createEvent<boolean>("Open or close awaiting dialog");
export const setAwaitingApproveDialogInfo = createEvent<AwaitingDialogInfo>("Set labels for awaiting dialog");
export const setAwaitingDialogSubmitted = createEvent<boolean>("Open or close awaiting dialog");
export const setApproveDialogSubmittedInfo = createEvent<SubmittedDialogInfo>("Open or close awaiting dialog");


$isAwaitingApproveDialogOpened.on(setAwaitingApproveDialogOpened, (_, data) => data);
$awaitingApproveDialogInfo.on(setAwaitingApproveDialogInfo, (_, data) => data);
$isAwaitingDialogSubmitted.on(setAwaitingDialogSubmitted, (_, data) => data);
$awaitingApproveDialogSubmittedInfo.on(setApproveDialogSubmittedInfo, (_, data) => data);
