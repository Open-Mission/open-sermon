"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface BibleVerse {
  reference: string;
  text: string;
  version: string;
}

async function fetchBibleVerse(
  ref: string,
  version: string
): Promise<BibleVerse> {
  const params = new URLSearchParams({ ref, version });
  const res = await fetch(`/api/bible?${params}`);

  if (!res.ok) {
    throw new Error("Failed to fetch Bible verse");
  }

  return res.json();
}

export function useBibleVerse(ref: string, version = "NVI") {
  return useQuery({
    queryKey: queryKeys.bible.verse(ref, version),
    queryFn: () => fetchBibleVerse(ref, version),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!ref,
  });
}
