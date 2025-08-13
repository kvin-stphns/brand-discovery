import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

export const neonDevnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 245022926),
  name: 'Neon Devnet',
  nativeCurrency: { name: 'NEON', symbol: 'NEON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_NEON_RPC_URL || 'https://devnet.neonevm.org'] },
  },
})

export const wagmiConfig = createConfig({
  chains: [neonDevnet],
  transports: { [neonDevnet.id]: http(neonDevnet.rpcUrls.default.http[0]) },
})