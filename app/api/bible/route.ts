import { NextResponse } from "next/server";
import { getCached, bibleVerseCacheKey } from "@/lib/redis";
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";

const VERSION_IDS: Record<string, string> = {
  NVI: "your-nvi-id",
  ARA: "your-ara-id",
  ACF: "your-acf-id",
  NTLH: "your-ntlh-id",
  NVT: "your-nvt-id",
  KJV: "de4e12af7f28f599-02",
  NIV: "your-niv-id",
};



async function generateVerseText(reference: string, version: string): Promise<string> {
  const versionPrompt: Record<string, string> = {
    NVI: "Nova Versão Internacional (NVI) em português",
    ARA: "Almeida Revista e Atualizada (ARA) em português",
    ACF: "Almeida Corrigida e Fiel (ACF) em português",
    NTLH: "Nova Tradução na Linguagem de Hoje (NTLH) em português",
    NVT: "Nova Versão Transformadora (NVT) em português",
    KJV: "King James Version (KJV) in English",
    NIV: "New International Version (NIV) in English",
  };

  const prompt = `You are a Bible verse provider. Return ONLY the exact text of ${reference} from the ${versionPrompt[version] || version} Bible translation. Do not add any commentary or explanation. If the reference spans multiple verses (or an entire chapter), you MUST include the verse numbers at the beginning of each verse followed by a dot (e.g., "1. No princípio... 2. A terra, porém..."). Do not include the book or chapter reference in the output text. If it is only a single verse, do not include the verse number. If the reference doesn't exist, respond with "NOT_FOUND".`;

  try {
    // Use AI Gateway with OpenAI model
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "medium",
        }),
      },
      stopWhen: stepCountIs(3),
    });

    console.log(text)

    const cleanText = text.trim();
    if (cleanText === "NOT_FOUND" || cleanText.length < 10) {
      return "";
    }
    return cleanText;
  } catch (error) {
    console.error("Error generating verse:", error);
    return "";
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");
    const version = searchParams.get("version") ?? "NVI";

    if (!ref) {
      return NextResponse.json(
        { error: "Reference parameter is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _versionId = VERSION_IDS[version] || VERSION_IDS.NVI;
    const cacheKey = bibleVerseCacheKey(ref, version);

    const verseData = await getCached(
      cacheKey,
      async () => {
        // First check mock data
        let verseText = "";

        // If not in mock data, use AI to generate the verse
        if (!verseText) {
          verseText = await generateVerseText(ref, version);
        }

        if (!verseText) {
          return {
            reference: ref,
            text: null,
            version: version,
            error: "Verse not found",
          };
        }

        return {
          reference: ref,
          text: verseText,
          version: version,
        };
      },
      86400 // Cache for 24 hours
    );

    return NextResponse.json(verseData);
  } catch (error) {
    console.error("Error fetching Bible verse:", error);
    return NextResponse.json(
      { error: "Failed to fetch Bible verse" },
      { status: 500 }
    );
  }
}