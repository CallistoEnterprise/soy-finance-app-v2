import {useEffect, useState} from "react";

export function useSoyPrice() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("https://api-data.absolutewallet.com/api/v1/currencies/detail-token?id=5948&fiat=USD");

      const data = await res.json();

      setPrice(data.price.price);
    })();
  }, [])

  return {
    loading: !price,
    price
  }
}
