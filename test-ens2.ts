import { createSubname } from '@ensdomains/ensjs/wallet'
export const x: Parameters<typeof createSubname>[1] = { name: "test", owner: "0x", contract: "hello" as any };
