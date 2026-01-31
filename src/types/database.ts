export interface Video {
  id: string;
  video_url: string;
  description: string;
  creator_wallet: string;
  is_exclusive: boolean;
  price: number;
  created_at: string;
}

export interface User {
  wallet_address: string;
  username: string;
  avatar_url: string;
  subscription_contract_address: string | null;
  subscription_name: string | null;
  subscription_symbol: string | null;
  subscription_price: number | null;
  subscription_image_url: string | null;
}

export type VideoInsert = Omit<Video, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type VideoUpdate = Partial<Omit<Video, "id">>;

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: Video;
        Insert: VideoInsert;
        Update: VideoUpdate;
      };
      users: {
        Row: User;
        Insert: User;
        Update: Partial<User>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
