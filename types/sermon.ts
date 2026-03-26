export type SermonStatus = "draft" | "in_progress" | "finished" | "preached";
export type SermonType = "preaching" | "cell" | "devotional";

export interface Series {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sermon {
  id: string;
  user_id: string;
  series_id: string | null;
  title: string;
  slug: string | null;
  status: SermonStatus;
  type: SermonType;
  main_scripture: string | null;
  tags: string[];
  blocks: unknown; // TipTap JSON content
  preached_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedBlock {
  id: string;
  user_id: string;
  type: "verse" | "illustration" | "application" | "point" | "intro" | "conclusion" | "text";
  title: string;
  content: unknown;
  tags: string[];
  created_at: string;
  updated_at: string;
}
