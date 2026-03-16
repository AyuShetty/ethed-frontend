import { createSubname } from '@ensdomains/ensjs/wallet'
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { addEnsContracts } from '@ensdomains/ensjs'

async function tryIt() {
  const pk = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const client = createWalletClient({ chain: addEnsContracts(mainnet), transport: http(), account: privateKeyToAccount(pk) })

  try {
     const fn = createSubname.makeFunctionData(client, { owner: '0x1111111111111111111111111111111111111111', name: 'sub.ayushetty.eth', contract: 'registry' } as any)
     console.log('SUCCESS', fn)
  } catch (e) {
     console.error('ERROR', e)
  }
}
tryIt()
