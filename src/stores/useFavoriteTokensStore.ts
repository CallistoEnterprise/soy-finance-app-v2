import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Address } from "viem";

type FavoriteTokens = {
  [key: number]: string[]
}

interface FavoriteTokensStore {
  favoriteTokens: FavoriteTokens,
  addFavoriteToken: (chainId: number, tokenAddress: Address) => void,
  removeFavoriteToken: (chainId: number, tokenAddress: Address) => void
}

const localStorageKey = "favorite-tokens";


export const useFavoriteTokensStore = create<FavoriteTokensStore>()(persist((set, get) => ({
  favoriteTokens: {},
  addFavoriteToken: (chainId, address) => set(() => {
    const currentFavoriteTokens = get().favoriteTokens;

    if (!currentFavoriteTokens[chainId]) {
      return { favoriteTokens: { ...currentFavoriteTokens, [chainId]: [address] } };
    }

    return { favoriteTokens: { ...currentFavoriteTokens, [chainId]: [...currentFavoriteTokens[chainId], address] } };
  }),
  removeFavoriteToken: (chainId, tokenAddress) => set(() => {
    const currentFavoriteTokens = get().favoriteTokens;

    if (currentFavoriteTokens[chainId]) {
      return { favoriteTokens: { ...currentFavoriteTokens, [chainId]: currentFavoriteTokens[chainId].filter((_address) => _address !== tokenAddress) } };
    }

    return {};
  })
}), {
  name: localStorageKey, // name of the item in the storage (must be unique)
}));
