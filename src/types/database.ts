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
}

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: Video;
        Insert: Omit<Video, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Video, "id">>;
      };
      users: {
        Row: User;
        Insert: User;
        Update: Partial<User>;
      };
    };
  };
}
