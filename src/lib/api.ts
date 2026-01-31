import { supabase } from "./supabase";
import type { Video, VideoInsert, User } from "@/types/database";

export interface UploadProgress {
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  message: string;
}

export async function uploadVideo(
  file: File,
  description: string,
  creatorWallet: string,
  isExclusive: boolean,
  price: number,
  onProgress?: (progress: UploadProgress) => void
): Promise<Video | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${creatorWallet}_${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    onProgress?.({
      progress: 10,
      status: "uploading",
      message: "Uploading video...",
    });

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      onProgress?.({
        progress: 0,
        status: "error",
        message: uploadError.message,
      });
      return null;
    }

    onProgress?.({
      progress: 70,
      status: "processing",
      message: "Processing video...",
    });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    // Insert into videos table
    const videoData: VideoInsert = {
      video_url: urlData.publicUrl,
      description,
      creator_wallet: creatorWallet,
      is_exclusive: isExclusive,
      price: isExclusive ? price : 0,
    };

    const { data, error: insertError } = await supabase
      .from("videos")
      .insert(videoData as never)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError.message);
      onProgress?.({
        progress: 0,
        status: "error",
        message: insertError.message,
      });
      return null;
    }

    onProgress?.({
      progress: 100,
      status: "complete",
      message: "Upload complete!",
    });

    return data;
  } catch (error) {
    console.error("Upload failed:", error);
    onProgress?.({
      progress: 0,
      status: "error",
      message: "Upload failed. Please try again.",
    });
    return null;
  }
}

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching videos:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getVideoById(id: string): Promise<Video | null> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching video:", error.message);
    return null;
  }

  return data;
}

export async function getVideosByCreator(wallet: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("creator_wallet", wallet)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching creator videos:", error.message);
    return [];
  }

  return data ?? [];
}

// ============================================
// User & Subscription Functions
// ============================================

export async function getUser(walletAddress: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error) {
    // User not found is not an error for our purposes
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching user:", error.message);
    return null;
  }

  return data;
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  return getUser(walletAddress);
}

export interface SubscriptionData {
  subscription_contract_address: string;
  subscription_name: string;
  subscription_symbol: string;
  subscription_price: number;
  subscription_image_url: string;
}

export async function upsertUserSubscription(
  walletAddress: string,
  subscriptionData: SubscriptionData
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        wallet_address: walletAddress.toLowerCase(),
        ...subscriptionData,
      } as never,
      { onConflict: "wallet_address" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting user subscription:", error.message);
    return null;
  }

  return data;
}

export async function uploadSubscriptionImage(
  file: File,
  walletAddress: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `subscription_${walletAddress.toLowerCase()}_${Date.now()}.${fileExt}`;
    const filePath = `subscriptions/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Subscription image upload error:", uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Failed to upload subscription image:", error);
    return null;
  }
}

export async function getCreatorSubscription(
  creatorWallet: string
): Promise<Pick<User, "subscription_contract_address" | "subscription_name" | "subscription_price"> | null> {
  const { data, error } = await supabase
    .from("users")
    .select("subscription_contract_address, subscription_name, subscription_price")
    .eq("wallet_address", creatorWallet.toLowerCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching creator subscription:", error.message);
    return null;
  }

  return data;
}
