"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, X, Check, AlertCircle, ImageIcon } from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
import { useDeployCreatorToken, parseDeployedAddress } from "@/lib/contracts/hooks";
import { uploadSubscriptionImage, upsertUserSubscription, getUser } from "@/lib/api";

type DeployStatus = "idle" | "uploading" | "signing" | "confirming" | "saving" | "complete" | "error";

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("1");
  const [maxSupply, setMaxSupply] = useState("1000");
  const [maxPerWallet, setMaxPerWallet] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [status, setStatus] = useState<DeployStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasExistingSubscription, setHasExistingSubscription] = useState(false);

  const { deploy, hash, isPending, error: deployError } = useDeployCreatorToken();

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  // Check for existing subscription on load
  useEffect(() => {
    async function checkExisting() {
      if (address) {
        const user = await getUser(address);
        if (user?.subscription_contract_address) {
          setHasExistingSubscription(true);
        }
      }
    }
    checkExisting();
  }, [address]);

  // Handle transaction confirmation
  useEffect(() => {
    async function handleConfirmed() {
      if (isConfirmed && receipt && address && status === "confirming") {
        setStatus("saving");

        // Parse deployed contract address from logs
        const contractAddress = parseDeployedAddress(receipt.logs);

        if (!contractAddress) {
          setStatus("error");
          setErrorMessage("Failed to get contract address from transaction");
          return;
        }

        // Save to Supabase
        const imageUrl = imagePreview || "";
        const result = await upsertUserSubscription(address, {
          subscription_contract_address: contractAddress,
          subscription_name: name,
          subscription_symbol: symbol,
          subscription_price: parseFloat(price),
          subscription_image_url: imageUrl,
        });

        if (!result) {
          setStatus("error");
          setErrorMessage("Failed to save subscription to database");
          return;
        }

        setStatus("complete");
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      }
    }
    handleConfirmed();
  }, [isConfirmed, receipt, address, status, imagePreview, name, symbol, price, router]);

  // Update status based on transaction state
  useEffect(() => {
    if (isPending && status === "uploading") {
      setStatus("signing");
    }
    if (isConfirming && status === "signing") {
      setStatus("confirming");
    }
  }, [isPending, isConfirming, status]);

  // Handle deploy error
  useEffect(() => {
    if (deployError) {
      setStatus("error");
      setErrorMessage(deployError.message || "Transaction failed");
    }
  }, [deployError]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!address || !name || !symbol || !price) {
      setErrorMessage("Please fill in all required fields");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    try {
      // Upload image first if provided
      let imageUrl = "";
      if (imageFile) {
        const uploadedUrl = await uploadSubscriptionImage(imageFile, address);
        if (!uploadedUrl) {
          setStatus("error");
          setErrorMessage("Failed to upload image");
          return;
        }
        imageUrl = uploadedUrl;
        // Update preview to the uploaded URL for saving later
        setImagePreview(uploadedUrl);
      }

      // Deploy contract
      await deploy({
        name,
        symbol: symbol.toUpperCase(),
        price,
        maxSupply: BigInt(maxSupply),
        maxPerWallet: BigInt(maxPerWallet),
        imageURI: imageUrl,
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Deployment failed");
    }
  };

  const truncatedWallet = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const isFormValid = name && symbol && price && parseFloat(price) > 0;
  const isDeploying = status !== "idle" && status !== "complete" && status !== "error";

  const getStatusMessage = () => {
    switch (status) {
      case "uploading":
        return "Uploading image...";
      case "signing":
        return "Confirm in wallet...";
      case "confirming":
        return "Confirming transaction...";
      case "saving":
        return "Saving subscription...";
      case "complete":
        return "Subscription created!";
      case "error":
        return errorMessage;
      default:
        return "";
    }
  };

  const getProgress = () => {
    switch (status) {
      case "uploading":
        return 20;
      case "signing":
        return 40;
      case "confirming":
        return 70;
      case "saving":
        return 90;
      case "complete":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20 pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-xl font-bold text-white">Create Subscription</h1>
      </div>

      {/* Wallet Status */}
      {isConnected ? (
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-white/60 text-sm">Connected: {truncatedWallet}</span>
        </div>
      ) : (
        <button
          onClick={() => openConnectModal?.()}
          className="w-full mb-6 py-3 bg-[#5F31E8] hover:bg-[#7C4DFF] rounded-xl text-white font-semibold transition-colors"
        >
          Connect Wallet
        </button>
      )}

      {/* Existing Subscription Warning */}
      {hasExistingSubscription && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">You already have a subscription</span>
          </div>
          <p className="text-yellow-500/70 text-sm mt-1">
            Creating a new one will replace your existing subscription.
          </p>
        </div>
      )}

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Subscription Image
        </label>
        {!imageFile ? (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-[#5F31E8] transition-colors bg-white/5">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#5F31E8]/20 flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-[#7C4DFF]" />
              </div>
              <p className="text-sm text-white">
                <span className="font-semibold">Tap to upload image</span>
              </p>
              <p className="text-xs text-white/60 mt-1">PNG, JPG, or GIF</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-white/5">
            <img
              src={imagePreview || undefined}
              alt="Subscription preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Subscription Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Ali's VIP Exclusive"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#5F31E8]"
          maxLength={50}
        />
      </div>

      {/* Symbol Input */}
      <div className="mb-4">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Symbol *
        </label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          placeholder="e.g., ALIVIP"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#5F31E8] uppercase"
          maxLength={10}
        />
        <p className="text-white/40 text-xs mt-1">3-10 characters, letters and numbers only</p>
      </div>

      {/* Price Input */}
      <div className="mb-4">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Price (MON) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#5F31E8]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7C4DFF] font-medium">
            MON
          </span>
        </div>
      </div>

      {/* Max Supply Input */}
      <div className="mb-4">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Max Supply
        </label>
        <input
          type="number"
          min="1"
          value={maxSupply}
          onChange={(e) => setMaxSupply(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#5F31E8]"
        />
        <p className="text-white/40 text-xs mt-1">Maximum number of subscriptions that can be minted</p>
      </div>

      {/* Max Per Wallet Input */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Max Per Wallet
        </label>
        <input
          type="number"
          min="1"
          value={maxPerWallet}
          onChange={(e) => setMaxPerWallet(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#5F31E8]"
        />
        <p className="text-white/40 text-xs mt-1">Maximum NFTs per wallet (usually 1)</p>
      </div>

      {/* Progress Bar */}
      {status !== "idle" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">{getStatusMessage()}</span>
            <span className="text-[#7C4DFF] text-sm font-medium">
              {getProgress()}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === "error"
                  ? "bg-red-500"
                  : status === "complete"
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-[#5F31E8] to-[#7C4DFF]"
              }`}
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          {status === "complete" && (
            <div className="flex items-center gap-2 mt-3 text-green-500">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Subscription created! Redirecting...</span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 mt-3 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Deploy Button */}
      <button
        onClick={handleDeploy}
        disabled={!isFormValid || isDeploying || status === "complete"}
        className="w-full py-4 bg-gradient-to-r from-[#5F31E8] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#5F31E8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
      >
        {isDeploying ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {status === "signing" ? "Confirm in Wallet..." : "Processing..."}
          </>
        ) : status === "complete" ? (
          <>
            <Check className="w-5 h-5" />
            Created!
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Deploy Subscription NFT
          </>
        )}
      </button>

      {/* Info Card */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-white font-medium mb-2">How it works</h3>
        <ul className="text-white/60 text-sm space-y-2">
          <li>1. Fill in your subscription details above</li>
          <li>2. Deploy your unique NFT contract on Monad</li>
          <li>3. Viewers mint your NFT to access exclusive content</li>
          <li>4. You receive payment directly when they mint</li>
        </ul>
      </div>
    </div>
  );
}
