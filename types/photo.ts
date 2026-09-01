export interface Photo {
  id: string;
  user_id: string;
  location_id: string;
  image_url: string;
  caption: string | null;
  likes_count: number;
}
