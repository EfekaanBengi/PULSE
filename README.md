# PULSE ⚡️

> **A decentralized social media application (dApp) developed for the Ankara Monad-Blitz Hackathon.** 🇹🇷

PULSE is a **Web3-native vertical video platform** (similar to TikTok/Reels) built on the **Monad ecosystem**. Creators can upload exclusive content, deploy their own subscription NFT contracts, and earn directly from their audience.

🔗 **Live Demo:** [monadshot.vercel.app](https://monadshot.vercel.app)

---

## ✨ Features

- **📱 Vertical Video Feed**: Smooth, mobile-first video swiping experience using `swiper` and `framer-motion`.
- **🔐 Wallet Connect**: Seamless login via **RainbowKit + Wagmi** (configured for Monad Testnet).
- **📹 Decentralized Uploads**: Videos are stored in **Supabase Storage** with metadata in Supabase DB.
- **💎 Creator Subscriptions**:
  - Creators can deploy their own **ERC-721 "CreatorNFT"** contract via our Factory.
  - **Exclusive Content**: Identify videos that are only unlockable by NFT holders.
- **💰 Monetization**:
  - Users mint Creator NFTs to subscribe.
  - Smart contracts handle ownership checks to unlock content.
- **🚀 PWA Support**: Installable on mobile devices for a native app-like experience.

> **⚠️ MVP Note:** In the current hackathon version, the unlock flow may use a placeholder transaction (sending MON to a burn address) for demonstration purposes. Production builds will route funds directly to the CreatorNFT `mint()` function.

---

## 🛠 Tech Stack

### Frontend & App
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **PWA**: `@ducanh2912/next-pwa`

### Web3 & Blockchain
- **Chain**: Monad Testnet
- **Interaction**: Wagmi, Viem, RainbowKit
- **Deployment**: Hardhat

### Backend & Storage
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (Videos/Thumbnails)

---

## 🔗 Smart Contracts

The project uses two main smart contracts located in the `contracts/` directory:

1. **`SubscriptionFactory.sol`**:
   - A factory contract that allows any user to deploy their own Creator NFT contract.
   - Emits `CreatorTokenDeployed` events for easier indexing.

2. **`CreatorNFT.sol`**:
   - An **ERC-721** standard contract representing a creator's subscription.
   - Handles `mint()` logic (payable) and `owner()` fund withdrawal.
   - Includes `hasSubscription(wallet)` helper for frontend checks.

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/EfekaanBengi/PULSE.git
cd PULSE
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
