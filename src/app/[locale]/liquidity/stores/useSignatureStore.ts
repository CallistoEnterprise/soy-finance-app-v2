import { create } from "zustand";

interface SignatureStore {
  signatureData: { v: number; r: string; s: string; deadline: bigint } | null,
  setSignatureData: (sig: { v: number; r: string; s: string; deadline: bigint } | null) => void,
  resetSignatures: () => void
}

export const useSignatureStore = create<SignatureStore>((set, get) => ({
  signatureData: null,
  setSignatureData: (signatureData) => set({signatureData}),
  resetSignatures: () => set({signatureData: null})
}));
