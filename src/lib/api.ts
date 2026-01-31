import { supabase } from "./supabase";
import type { Video, VideoInsert } from "@/types/database";

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
