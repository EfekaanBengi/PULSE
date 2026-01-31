import { supabase } from "./supabase";
import type { Video } from "@/types/database";

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
