"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Video, X, Check, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { uploadVideo, UploadProgress } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isExclusive, setIsExclusive] = useState(false);
  const [price, setPrice] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!file || !address) return;

    setIsUploading(true);

    const result = await uploadVideo(
      file,
      description || "No description",
      address,
      isExclusive,
      price,
      setUploadProgress
    );

    setIsUploading(false);

    if (result) {
      // Success - redirect to home after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  const truncatedWallet = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-black pb-20 pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-xl font-bold text-white">Upload Video</h1>
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
          Connect Wallet to Upload
        </button>
      )}

      {/* File Upload Area */}
      <div className="mb-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-[#5F31E8] transition-colors bg-white/5">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-16 h-16 rounded-full bg-[#5F31E8]/20 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-[#7C4DFF]" />
              </div>
              <p className="mb-2 text-sm text-white">
                <span className="font-semibold">Tap to upload</span>
              </p>
              <p className="text-xs text-white/60">MP4, WebM, or MOV (MAX. 100MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-white/5">
            <video
              src={preview || undefined}
              className="w-full h-full object-cover"
              controls
            />
            <button
              onClick={handleRemoveFile}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-full">
              <Video className="w-4 h-4 text-[#7C4DFF]" />
              <span className="text-white text-xs truncate max-w-[150px]">
                {file.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <label className="block text-white/80 text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your video..."
          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#5F31E8] resize-none"
          maxLength={200}
        />
        <p className="text-right text-white/40 text-xs mt-1">
          {description.length}/200
        </p>
      </div>

      {/* Exclusive Toggle */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Exclusive Content</h3>
            <p className="text-white/60 text-sm">Require payment to unlock</p>
          </div>
          <button
            onClick={() => setIsExclusive(!isExclusive)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isExclusive ? "bg-[#5F31E8]" : "bg-white/20"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                isExclusive ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Price Input */}
        {isExclusive && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Price (MON)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                value={price}
                onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#5F31E8]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7C4DFF] font-medium">
                MON
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploadProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">{uploadProgress.message}</span>
            <span className="text-[#7C4DFF] text-sm font-medium">
              {uploadProgress.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                uploadProgress.status === "error"
                  ? "bg-red-500"
                  : uploadProgress.status === "complete"
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-[#5F31E8] to-[#7C4DFF]"
              }`}
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          {uploadProgress.status === "complete" && (
            <div className="flex items-center gap-2 mt-3 text-green-500">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Video uploaded successfully!</span>
            </div>
          )}
          {uploadProgress.status === "error" && (
            <div className="flex items-center gap-2 mt-3 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{uploadProgress.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading || uploadProgress?.status === "complete"}
        className="w-full py-4 bg-gradient-to-r from-[#5F31E8] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#5F31E8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </>
        ) : uploadProgress?.status === "complete" ? (
          <>
            <Check className="w-5 h-5" />
            Uploaded!
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload Video
          </>
        )}
      </button>
    </div>
  );
}
