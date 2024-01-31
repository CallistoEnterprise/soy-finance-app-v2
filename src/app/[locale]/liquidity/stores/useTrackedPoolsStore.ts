import { create } from "zustand";
import { persist } from "zustand/middleware";

type SavedPoolPair = [string, string];

const localStorageKey = "tracked-pools";
interface TrackedPoolsStore {
  trackedPools: { [key: number]: SavedPoolPair[] },
  setTrackedPools: (trackedPools: { [key: number]: SavedPoolPair[] }) => void,
  addTrackedPool: ({ chainId, pairToTrack }: { chainId: number, pairToTrack: SavedPoolPair }) => void
}

export const useTrackedPoolsStore = create<TrackedPoolsStore>()(persist((set, get) => ({
  trackedPools: {},
  setTrackedPools: (trackedPools) => set({ trackedPools }),
  addTrackedPool: ({ chainId, pairToTrack }) => set(() => {
    if (!get().trackedPools[chainId]) {
      return {
        trackedPools: {
          ...get().trackedPools,
          [chainId]: [pairToTrack]
        }
      };
    }

    if (get().trackedPools[chainId]) {
      return { trackedPools: {
          ...get().trackedPools,
          [chainId]: [...get().trackedPools[chainId], pairToTrack]
        },
      }
    }

    return {}
  })
}), {
  name: "tracked-pools"
}));
