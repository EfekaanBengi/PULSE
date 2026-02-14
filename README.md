# PULSE ⚡️
**TikTok-style video dApp on Monad Testnet** — creators can upload videos, mark them as **exclusive**, and set up a **Subscription NFT** collection for paid access.

Live demo: https://monadshot.vercel.app :contentReference[oaicite:1]{index=1}

---

## ✨ Features
- **Vertical video feed** (Swiper) + smooth mobile-first UI :contentReference[oaicite:2]{index=2}  
- **Wallet connect** via RainbowKit + Wagmi (Monad Testnet configured) :contentReference[oaicite:3]{index=3}  
- **Upload video** to Supabase Storage + save metadata to Supabase DB :contentReference[oaicite:4]{index=4}  
- **Exclusive content toggle** on upload (creators only) :contentReference[oaicite:5]{index=5}  
- **Create Subscription**: deploy your own ERC-721 “CreatorNFT” contract via factory :contentReference[oaicite:6]{index=6}  
- **Subscription check**: if user owns creator’s NFT => content unlock :contentReference[oaicite:7]{index=7}  
- **Earnings / Subscribers page** (reads contract balance + token owners via multicall) :contentReference[oaicite:8]{index=8}  

> ⚠️ MVP note: Unlock flow currently sends **1 MON** to a dummy address (`0x...dEaD`) as a placeholder. In production you’d typically call the creator’s `mint()` on their `CreatorNFT` contract. :contentReference[oaicite:9]{index=9}

---

## 🧱 Tech Stack
- **Next.js 16** (App Router) :contentReference[oaicite:10]{index=10}  
- **TypeScript**, **TailwindCSS v4**, **Framer Motion** :contentReference[oaicite:11]{index=11}  
- **Wagmi + RainbowKit + Viem** (wallet, reads/writes) :contentReference[oaicite:12]{index=12}  
- **Hardhat** (deploy to Monad Testnet) :contentReference[oaicite:13]{index=13}  
- **Supabase** (Storage + Postgres) :contentReference[oaicite:14]{index=14}  
- **PWA** enabled via `@ducanh2912/next-pwa` :contentReference[oaicite:15]{index=15}  

---

## 🔗 Smart Contracts
### `SubscriptionFactory.sol`
Creators deploy their own `CreatorNFT` contracts using:
- `deployCreatorToken(name, symbol, price, maxSupply, maxPerWallet, imageURI)` :contentReference[oaicite:16]{index=16}  
- Emits `CreatorTokenDeployed(creator, contractAddress, ...)` :contentReference[oaicite:17]{index=17}  

### `CreatorNFT.sol`
ERC-721 subscription NFT contract:
- `mint()` is **payable**, checks limits, then forwards funds to creator (`owner()`) :contentReference[oaicite:18]{index=18}  
- `hasSubscription(wallet)` returns true if wallet owns at least one token :contentReference[oaicite:19]{index=19}  
- Metadata is **on-chain** (`tokenURI` returns base64 JSON) :contentReference[oaicite:20]{index=20}  

---

