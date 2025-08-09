⸻

/docs/WEB3/DATA_FLOW.md

Web3 Data Flow – Neon EVM + MongoDB Hybrid Model

Audience Note:
This document outlines how data moves between Web2 and Web3 systems in the platform.
The agent must ensure synchronization between blockchain state and MongoDB without creating double sources of truth.

⸻

Overview

The platform uses:
	•	Web3 (Neon EVM) for immutable, verifiable actions like voting, NFT receipts, and brand verification.
	•	Web2 (MongoDB) for fast querying and UI rendering.

⸻

Voting Flow
	1.	User Action → Clicks “Vote” on brand/designer/product.
	2.	Check Wallet Status:
	•	If connected → Proceed to on-chain vote.
	•	If not connected → Prompt wallet connection.
	3.	On-Chain Vote Transaction:
	•	Contract: vote(uint256 itemId, bool upvote)
	•	Sent via Neon EVM RPC.
	4.	Backend Sync:
	•	After on-chain success, backend writes:
	•	itemId
	•	voteType
	•	walletAddress
	•	timestamp
	•	Stored in MongoDB for frontend queries.
	5.	UI Update:
	•	Instant update from MongoDB → No need to wait for blockchain indexing.

⸻

NFT Receipt Flow (Future)
	1.	User Purchase → Affiliate checkout triggers webhook.
	2.	Backend Verifies Purchase → Confirms order.
	3.	Mint NFT via Neon EVM smart contract:
	•	Includes metadata:
	•	Brand
	•	Product
	•	Purchase date
	4.	Wallet Receives NFT → Appears in profile.

⸻

Brand Verification Flow (Future)
	1.	Brand Submits Verification Request.
	2.	Platform Issues NFT Badge after review.
	3.	Badge is Publicly Viewable on brand’s profile.

⸻

Data Synchronization Rules
	•	Blockchain → MongoDB:
	•	Votes and NFT actions are mirrored in MongoDB for fast retrieval.
	•	MongoDB → Blockchain:
	•	Never push votes from DB to chain except for batch processing fallback (if chain failed earlier).
	•	Use event listeners on Neon EVM to detect:
	•	New votes
	•	NFT mints
	•	Verification changes

⸻

Security & Integrity
	•	Sign all transactions before sending.
	•	Validate wallet signatures on backend API.
	•	Use rate limiting to prevent spam votes.

⸻

Diagram (Text Version)

[Frontend UI] 
    ↓ wallet connect
[Web3 Provider] ----> [Neon EVM Smart Contract]
    ↑                 ↓  event listener
[Backend API] <----> [MongoDB Database]


⸻
