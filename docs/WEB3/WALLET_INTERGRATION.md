Got it — here are the two missing docs, fully fleshed out and tailored to your augment-not-rewrite project state.

⸻

/docs/WEB3/WALLET_INTEGRATION.md

Web3 Wallet Integration – Implementation Guide

Audience Note:
This project’s Web3 features will be implemented incrementally. The current phase is Phase 1, focusing on wallet connections and basic on-chain voting.
The agent must not break existing frontend or backend logic — instead, it will add wallet functionality on top of the current structure.

⸻

Purpose

Enable users to connect their cryptocurrency wallet (MetaMask, WalletConnect, Coinbase Wallet, etc.) to:
	•	Participate in on-chain voting.
	•	Authenticate their identity for Web3 actions (saving, voting, NFT receipts).
	•	Enable future Web3 features such as brand verification and proof-of-purchase NFTs.

⸻

Phase 1 Requirements
	•	Wallet Connect Button in the header or persistent UI area.
	•	Detect connected wallet status across the platform.
	•	Store connected wallet address in frontend state and backend DB (linked to user account).
	•	Trigger on-chain voting transactions after wallet connection.

⸻

Supported Wallet Providers
	1.	MetaMask (primary target)
	2.	WalletConnect (mobile + multi-wallet support)
	3.	Coinbase Wallet (secondary priority)

⸻

Technical Implementation

Frontend
	•	Use wagmi + viem (or ethers.js if lighter integration needed) for wallet connections.
	•	Add a “Connect Wallet” button in the global navigation/header.
	•	Persist wallet connection in Redux/Zustand store (or existing state management).
	•	On connection:
	•	Display truncated address (e.g., 0x1234...abcd).
	•	Trigger backend API call to link wallet address to user account.

Backend
	•	Extend User model to store:

walletAddress: { type: String, index: true },
walletProvider: { type: String }


	•	Add /api/user/wallet endpoint to:
	•	Store wallet address.
	•	Verify signature if needed.

Web3
	•	Use Neon EVM RPC for:
	•	Checking wallet balances (optional for UI).
	•	Sending voting transactions.
	•	Smart contract voting function signature:

function vote(uint256 itemId, bool upvote) public



⸻

UI/UX Notes
	•	Minimalist but premium design for wallet UI.
	•	Integrate with existing Swedish-grid Balenciaga-inspired aesthetic.
	•	Match button styling with avant-garde brand feel.
	•	Smooth animations for connect/disconnect state changes.

⸻

Testing
	•	Test wallet connection in Chrome + MetaMask.
	•	Test mobile connection via WalletConnect.
	•	Verify votes are recorded on-chain after wallet connection.

⸻

Next Steps After Phase 1
	•	Implement NFT proof-of-purchase receipts.
	•	Enable brand/designer verification NFTs.
	•	Add wallet-based profile enhancements.

⸻

