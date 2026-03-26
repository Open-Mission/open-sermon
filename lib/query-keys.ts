export const queryKeys = {
  sermons: {
    all: ["sermons"] as const,
    list: (limit?: number) =>
      limit ? (["sermons", "list", limit] as const) : (["sermons", "list"] as const),
    detail: (id: string) => ["sermons", "detail", id] as const,
  },
  bible: {
    all: ["bible"] as const,
    verse: (ref: string, version: string) =>
      ["bible", "verse", ref, version] as const,
  },
} as const;
