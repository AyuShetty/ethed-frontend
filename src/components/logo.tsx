import Image from "next/image";

export default function Logo() {
  return (
<Image src="/logos/logo.png" alt="ETH"             height={32}
            width={128}
            className="h-8 mx-auto invert"/>
  )
}
