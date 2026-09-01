export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
}
