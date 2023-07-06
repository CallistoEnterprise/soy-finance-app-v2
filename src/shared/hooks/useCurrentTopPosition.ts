import { useEffect, useState } from "react";

export function useCurrentTopPosition(positions, ref) {
  const [currentTopPosition, setCurrentTopPosition] = useState(0);

  useEffect(
    () => {
      if (positions?.top) {
        if (ref?.current?.getBoundingClientRect()?.height) {
          if (positions.top + ref?.current?.getBoundingClientRect()?.height > window.innerHeight) {
            const difference = positions.top + ref?.current?.getBoundingClientRect()?.height - window.innerHeight;
            setCurrentTopPosition(positions.top - difference - 10);
          } else {
            setCurrentTopPosition(positions.top);
          }
        }
      }
    },
    [ref, positions]
  );

  return { currentTopPosition };
}
