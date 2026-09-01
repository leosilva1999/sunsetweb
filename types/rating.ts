export interface Rating {
  id: string;
  user_id: string;
  location_id: string;
  score: 1 | 2 | 3 | 4 | 5;
}
