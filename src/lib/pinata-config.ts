import { env } from "@/env";
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT,
  pinataGateway: env.PINATA_GATEWAY_URL,
});
