"use client";

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, decodeEventLog, type Address, type Hash } from "viem";
import { SubscriptionFactoryABI, CreatorNFTABI } from "./abis";
import { SUBSCRIPTION_FACTORY_ADDRESS } from "./addresses";

/**
 * Hook to deploy a new CreatorNFT contract via the factory
 */
export function useDeployCreatorToken() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deploy = async (params: {
    name: string;
    symbol: string;
    price: string; // in MON (e.g., "1.5")
    maxSupply: bigint;
    maxPerWallet: bigint;
    imageURI: string;
  }) => {
    const priceWei = parseEther(params.price);

    const txHash = await writeContractAsync({
      address: SUBSCRIPTION_FACTORY_ADDRESS,
      abi: SubscriptionFactoryABI,
      functionName: "deployCreatorToken",
      args: [
        params.name,
        params.symbol,
        priceWei,
        params.maxSupply,
        params.maxPerWallet,
        params.imageURI,
      ],
    });

    return txHash;
  };

  return {
    deploy,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Extract the deployed contract address from transaction logs
 */
export function parseDeployedAddress(logs: { topics: readonly `0x${string}`[]; data: `0x${string}` }[]): Address | null {
  for (const log of logs) {
    try {
      // Cast topics to mutable array for decodeEventLog
      const topics = [...log.topics] as [`0x${string}`, ...`0x${string}`[]];
      const decoded = decodeEventLog({
        abi: SubscriptionFactoryABI,
        data: log.data,
        topics,
      });

      if (decoded.eventName === "CreatorTokenDeployed") {
        return decoded.args.contractAddress;
      }
    } catch {
      // Not our event, continue
    }
  }
  return null;
}

/**
 * Hook to check if a user has a subscription (owns NFT)
 */
export function useHasSubscription(contractAddress: Address | undefined, userAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "hasSubscription",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(contractAddress) && Boolean(userAddress),
    },
  });
}

/**
 * Hook to get subscription price in wei
 */
export function useSubscriptionPrice(contractAddress: Address | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "price",
    query: {
      enabled: Boolean(contractAddress),
    },
  });
}

/**
 * Hook to get subscription NFT details
 */
export function useSubscriptionDetails(contractAddress: Address | undefined) {
  const { data: name } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "name",
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: price } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "price",
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: totalSupply } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "totalSupply",
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: maxSupply } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "maxSupply",
    query: { enabled: Boolean(contractAddress) },
  });

  return { name, price, totalSupply, maxSupply };
}

/**
 * Hook to mint a subscription NFT
 */
export function useMintSubscription() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = async (contractAddress: Address, priceWei: bigint) => {
    const txHash = await writeContractAsync({
      address: contractAddress,
      abi: CreatorNFTABI,
      functionName: "mint",
      value: priceWei,
    });

    return txHash;
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to check minting limits
 */
export function useMintingLimits(contractAddress: Address | undefined, userAddress: Address | undefined) {
  const { data: mintedBy } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "mintedBy",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(contractAddress) && Boolean(userAddress) },
  });

  const { data: maxPerWallet } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "maxPerWallet",
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: totalSupply } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "totalSupply",
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: maxSupply } = useReadContract({
    address: contractAddress,
    abi: CreatorNFTABI,
    functionName: "maxSupply",
    query: { enabled: Boolean(contractAddress) },
  });

  const canMint =
    mintedBy !== undefined &&
    maxPerWallet !== undefined &&
    totalSupply !== undefined &&
    maxSupply !== undefined &&
    mintedBy < maxPerWallet &&
    totalSupply < maxSupply;

  const isWalletLimitReached = mintedBy !== undefined && maxPerWallet !== undefined && mintedBy >= maxPerWallet;
  const isSupplyReached = totalSupply !== undefined && maxSupply !== undefined && totalSupply >= maxSupply;

  return {
    mintedBy,
    maxPerWallet,
    totalSupply,
    maxSupply,
    canMint,
    isWalletLimitReached,
    isSupplyReached,
  };
}
