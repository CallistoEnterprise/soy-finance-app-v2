import Image from "next/image";

export default function ThemedLogo() {
  return <>
    <Image
      className="dark:hidden"
      width={132}
      height={46}
      src="/Logo.svg"
      alt="Soy finance"
    />
    <Image
      className="dark:block hidden"
      width={132}
      height={46}
      src="/Logo-Dark.svg"
      alt="Soy finance"
    />
  </>
}
