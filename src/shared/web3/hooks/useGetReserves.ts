import {useEffect, useState} from "react";
import {CallState} from "../../types";

export function useGetReserves() {
  const [callState, setCallState] = useState<CallState>(CallState.INITIAL);
  const [result, setResult] = useState([]);

  useEffect(() => {

  }, []);

  return {
    callState,
    result
  }
}
