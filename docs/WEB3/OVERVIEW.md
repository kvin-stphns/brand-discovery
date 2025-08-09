
⸻

/docs/WEB3/OVERVIEW.md

Mode: Augment-not-rewrite · Audience: Cursor Agent (primary), project owner (novice)
Goal: Introduce Web3 scope, phases, and how it attaches to the existing Web2 foundation without breaking anything.

⸻

0) Read Me First (Agent)
	•	Do not block UI or backend work while adding Web3—ship Web3 in phases with mocked adapters first.
	•	Always prefer progressive enhancement: if wallets/contracts are unavailable, the app continues with Web2 storage & UX.
	•	Any contract deployment, address changes, or schema changes must be logged in /docs/CHANGELOG.md and captured as an ADR in /docs/DECISIONS/ (e.g., ADR-0004-neon-contract-layout.md).
	•	All sensitive keys must live in .env files. Never hardcode private keys.

⸻

1) Web3 MVP Scope (Phase 1 → Phase 2)

Phase 1 (MVP)
	•	Wallet connect (MetaMask + WalletConnect) with SIWE-like message signing (off-chain auth → JWT).
	•	On-chain voting for brands/designers/products (Neon EVM testnet first).
	•	Read-only on-chain score fetch with a Web2 cache for speed.
	•	Off-chain mirrors (MongoDB) to support ranking pages and analytics.

Phase 2 (Post-MVP)
	•	NFT receipt (ERC-721) for proof-of-purchase — minted when affiliate checkout webhook confirms purchase.
	•	Brand Registry (optional) with verified brand signer (prevents spoofing).
	•	On-chain batching for Web2 votes promoted on-chain periodically.

⸻

2) Target Chain & Tooling
	•	Chain: Neon EVM (testnet for dev, mainnet post-hardening).
	•	RPC: Neon’s public RPCs (configure in env).
	•	Contracts: Solidity ^0.8.20, Hardhat or Foundry. (Agent picks one but must document in ADR.)
	•	Client libs: ethers v6, wagmi, viem (Agent may choose wagmi/viem combo).
	•	Wallets: MetaMask, WalletConnect v2 (Rainbow, Coinbase Wallet, etc).

⸻

3) Smart Contracts (at a glance)
	1.	VotingHub (MVP)
	•	Registers entities (brand/designer/product) by a canonical ID string (hash).
	•	Functions: vote(entityId, weight), getScore(entityId).
	•	Uses simple additive scores; includes anti-double-vote per wallet per epoch.
	•	Emits: Voted(wallet, entityId, weight, epoch).
	2.	PurchaseReceiptNFT (Phase 2)
	•	ERC-721 minted only by minter role (our backend) when an affiliate order clears.
	•	TokenURI points to JSON metadata (IPFS gateway initially is fine).
	•	Emits: ReceiptMinted(orderId, wallet, tokenId).
	3.	BrandRegistry (Optional/Phase 2)
	•	Map brandId → signer.
	•	Can be used to verify that a given brand has attested to its profile or collections.

Full specs live in /docs/WEB3/CONTRACTS_SPEC.md.

⸻

4) Wallet & Auth Model
	•	Step 1: User connects wallet (MetaMask/WalletConnect).
	•	Step 2: Backend issues a nonce; user signs “Sign-in With Ethereum” style message.
	•	Step 3: Backend verifies signature → returns JWT (short TTL). JWT used for Web2 API calls.
	•	Step 4: On-chain actions (vote, claim receipt) still require wallet tx; we never send private keys to backend.

Detailed flows in /docs/WEB3/WALLET_INTEGRATION.md.

⸻

5) Data Flow (Hybrid Web2/Web3)
	•	Votes:
	•	UI → Backend: optimistic update + store vote in MongoDB.
	•	Backend → Chain: immediate on-chain vote if user is connected and tx confirmed. If not, keep Web2 vote; a batch process can later promote to chain (Phase 2).
	•	Frontend Rankings: read from Web2 aggregated scores; optionally cross-check top items via on-chain reads.
	•	NFT receipts:
	•	Affiliate webhook confirms purchase → backend validates order → mints ERC-721 to buyer’s wallet.
	•	Caching:
	•	Cache on-chain scores in MongoDB with refresh intervals to reduce RPC load.

⸻

6) Security Principles
	•	Never hold user private keys; txs are signed client-side.
	•	Validate entityId to avoid arbitrary storage spam (hash canonical slugs).
	•	Rate-limit vote ingestion endpoints.
	•	Enforce per-wallet epoch constraints (e.g., 1 weighted vote per entity per epoch).
	•	Revocation: If an order is refunded, optionally burn/flag receipt NFTs (policy decision—document in ADR if added).

⸻

7) Developer Ergonomics
	•	All Web3 features are abstracted behind:
	•	/frontend/lib/web3/client.ts (wagmi/viem + config)
	•	/frontend/lib/web3/votes.ts (read/write helpers)
	•	/frontend/lib/web3/receipts.ts (Phase 2)
	•	Never sprinkle ethers calls in UI components. Use hooks/helpers.

⸻

8) Acceptance (Gate 3 – “Web3 Phase 1 Live”)
	•	✅ Wallet connect works for MetaMask + WalletConnect on testnet.
	•	✅ VotingHub deployed to Neon testnet; addresses in /docs/WEB3/ADDRESSES.json.
	•	✅ UI voting flow triggers on-chain vote and shows confirmed score deltas.
	•	✅ Web2 fallback (no wallet) still lets users “vote” (stored off-chain); clearly marked as “off-chain vote”.
	•	✅ Changelog + ADR updated with deployment tooling selection and addresses.

⸻

End of file

⸻

/docs/WEB3/CONTRACTS_SPEC.md

Mode: Augment-not-rewrite · Audience: Cursor Agent (primary), project owner (novice)
Goal: Production-grade specs for Neon EVM contracts with progressive rollout (vote first, receipts later), plus deployment/testing instructions the Agent can execute.

⸻

0) Read Me First (Agent)
	•	Start with VotingHub only (MVP).
	•	Use a single monorepo package for contracts (e.g., /contracts).
	•	Prefer Hardhat (plugins ecosystem) unless you choose Foundry (document choice in ADR).
	•	Provide deployment scripts for Neon testnet with safe default gas and confirmations.
	•	Export a typed ABI JSON into /frontend/lib/web3/abi/.

⸻

1) VotingHub.sol (MVP)

1.1 Purpose

On-chain additive scoring for entities (brand/designer/product) keyed by hashed IDs. Prevents duplicate voting per wallet per epoch.

1.2 Interfaces (Solidity)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVotingHub {
    event Voted(address indexed voter, bytes32 indexed entityId, int256 weight, uint64 epoch);

    function vote(bytes32 entityId, int256 weight) external;
    function getScore(bytes32 entityId) external view returns (int256);
    function getLastVoteEpoch(address voter, bytes32 entityId) external view returns (uint64);
    function currentEpoch() external view returns (uint64);
}

1.3 Implementation Summary
	•	Storage
	•	mapping(bytes32 => int256) public scores;
	•	mapping(address => mapping(bytes32 => uint64)) public lastVoteEpoch;
	•	uint64 public epochLength; // seconds
	•	uint64 public genesis; // block.timestamp at deploy
	•	Current epoch: (block.timestamp - genesis) / epochLength.
	•	Constraints
	•	One vote per wallet per entity per epoch.
	•	weight allowed range: [-5, +5] (configurable) to limit abuse.
	•	Admin
	•	Owner can set epochLength and maxAbsWeight before mainnet lock (add lockConfig() to freeze).

1.4 Pseudocode (Core)

function vote(bytes32 entityId, int256 weight) external {
  require(weight != 0, "NO_ZERO");
  require(abs(weight) <= maxAbsWeight, "OVER_WEIGHT");

  uint64 e = currentEpoch();
  require(lastVoteEpoch[msg.sender][entityId] < e, "ALREADY_VOTED");

  scores[entityId] += weight;
  lastVoteEpoch[msg.sender][entityId] = e;

  emit Voted(msg.sender, entityId, weight, e);
}

1.5 EntityId Canonicalization (Frontend/Backend)
	•	Compute entityId = keccak256(abi.encodePacked(normalizedSlug)).
	•	Normalization rule (same everywhere): lowercase, trim, replace spaces with -, strip non-alphanumerics except -.
	•	Provide helper in /frontend/lib/web3/ids.ts.

1.6 Events & Indexing
	•	Voted event powers analytics dashboards.
	•	Optional: Write a simple indexer job (later) to listen, aggregate to MongoDB, and compare on-chain vs off-chain totals.

⸻

2) PurchaseReceiptNFT.sol (Phase 2)

2.1 Purpose

Mintable ERC-721 to a buyer address when off-chain affiliate checkout confirms. Metadata includes order basics.

2.2 Interfaces (Solidity)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPurchaseReceiptNFT {
    event ReceiptMinted(bytes32 indexed orderId, address indexed to, uint256 tokenId);

    function mintReceipt(bytes32 orderId, address to, string calldata tokenURI) external returns (uint256);
    function setMinter(address newMinter) external;
}

2.3 Implementation Summary
	•	Inherits ERC721, Ownable.
	•	minter role (backend deployer) controls mintReceipt.
	•	orderId → tokenId mapping to prevent double mint.
	•	Policy (decide in ADR): whether receipts are burnable on refund.

2.4 Metadata
	•	Store JSON on IPFS (Agent: add a tiny pinning util or use a gateway for MVP).
	•	Suggested fields: brand, product, price (optional), purchaseDate, affiliateSource, txHash (if applicable), image.

⸻

3) BrandRegistry.sol (Optional/Phase 2+)
	•	Map brandId (bytes32) → brandSigner (address).
	•	Functions:
	•	registerBrand(bytes32 brandId, address signer) (owner-only or via verification process).
	•	attest(bytes32 brandId, bytes calldata msg) (EIP-712-signed claims by brandSigner).

⸻

4) Environments & Addresses

Create /docs/WEB3/ADDRESSES.json after deployment:

{
  "neonDevnet": {
    "VotingHub": "0x...",
    "PurchaseReceiptNFT": "0x...",
    "BrandRegistry": "0x..."
  },
  "neonMainnet": {
    "VotingHub": "",
    "PurchaseReceiptNFT": "",
    "BrandRegistry": ""
  }
}


⸻

5) Hardhat Project Layout (Agent)

/contracts
  /src
    VotingHub.sol
    PurchaseReceiptNFT.sol
    BrandRegistry.sol (optional)
  /scripts
    deploy_votinghub.ts
    deploy_receipts.ts
  /test
    votinghub.spec.ts
    receipts.spec.ts
  hardhat.config.ts
  package.json

5.1 Hardhat Config Snippet

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    neonDevnet: {
      url: process.env.NEON_RPC!,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    },
  }
};
export default config;

5.2 Deploy Script (VotingHub)

import { ethers } from "hardhat";

async function main() {
  const epochLength = 24 * 60 * 60; // 1 day
  const maxAbsWeight = 5;

  const VotingHub = await ethers.getContractFactory("VotingHub");
  const hub = await VotingHub.deploy(epochLength, maxAbsWeight);
  await hub.waitForDeployment();

  console.log("VotingHub:", await hub.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });


⸻

6) Frontend Integration Contract ABIs
	•	After compile, export minimal ABIs to:
	•	/frontend/lib/web3/abi/VotingHub.json
	•	/frontend/lib/web3/abi/PurchaseReceiptNFT.json
	•	Add typed wrappers:
	•	/frontend/lib/web3/contracts.ts (addresses + getContract helpers).
	•	/frontend/lib/web3/ids.ts (entityId hashing).
	•	/frontend/lib/web3/votes.ts (read: getScore, write: vote).

⸻

7) Testing & QA (Contracts)

7.1 Unit (Hardhat)
	•	VotingHub
	•	Prevent double vote within same epoch.
	•	Allow vote in next epoch.
	•	Enforce weight bounds.
	•	Emit Voted with correct fields.
	•	ReceiptNFT
	•	Only minter can mint.
	•	Prevent duplicate orderId.
	•	Metadata set properly.

7.2 Integration (Simulated)
	•	From a script, call vote for a few entities, check scores.
	•	Simulate “purchase webhook” → backend signs → mint receipt → verify token owner.

7.3 Security
	•	Slither/static analysis (if time permits).
	•	Gas snapshot (optional) to track changes.

⸻

8) Migration Plan (Safe Rollout)
	•	Dev: Deploy VotingHub on Neon devnet; commit addresses.
	•	Wire frontend voting to devnet with clear “Testnet” banner for MVP.
	•	Once stable, deploy on mainnet and switch addresses.

⸻

9) Agent Checklist (Gate 3)
	•	Create /contracts with Hardhat.
	•	Implement VotingHub exactly as spec (or propose ADR if deviating).
	•	Add tests; get green.
	•	Deploy to Neon devnet; write /docs/WEB3/ADDRESSES.json.
	•	Export ABIs; add frontend wrappers/hooks.
	•	Wire UI “vote” buttons to chain with graceful fallback.
	•	Update /docs/SCOPE_AND_PHASES.md progress + wait for approval.

⸻

End of file

⸻
