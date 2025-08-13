const { createPublicClient, createWalletClient, http, parseAbi, getAddress } = require('viem')

const ABI = parseAbi([
  'event Voted(address indexed voter, uint256 indexed entityId, uint256 weight)',
  'function vote(uint256 entityId, uint256 weight) external',
])

async function vote({ rpcUrl, privateKey, contractAddress, entityId, weight }) {
  try {
    if (!rpcUrl || !privateKey || !contractAddress) {
      // eslint-disable-next-line no-console
      console.warn('[web3] missing config; returning dry-run txHash')
      return { txHash: `dryrun-${Date.now()}` }
    }
    const chain = { id: Number(process.env.CHAIN_ID || 245022926), name: 'Neon', nativeCurrency: { name: 'NEON', symbol: 'NEON', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } }
    const client = createWalletClient({ transport: http(rpcUrl), chain, account: privateKey })
    const hash = await client.writeContract({ address: getAddress(contractAddress), abi: ABI, functionName: 'vote', args: [BigInt(entityId), BigInt(weight || 1)] })
    return { txHash: String(hash) }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[web3] vote failed; returning dry-run txHash', e.message)
    return { txHash: `dryrun-${Date.now()}` }
  }
}

module.exports = { vote }