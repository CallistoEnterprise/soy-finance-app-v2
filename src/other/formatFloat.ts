export function formatFloat(value: number | string) {
  const numberValue = Number(value);

  if(numberValue < 1) {
    return numberValue.toLocaleString("en-US", {
      maximumSignificantDigits: 2
    })
  } else {
    return numberValue.toFixed(2)
  }
}
