import { NextResponse } from "next/server";
import { getCached, bibleVerseCacheKey } from "@/lib/redis";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const VERSION_IDS: Record<string, string> = {
  NVI: "your-nvi-id",
  ARA: "your-ara-id",
  ACF: "your-acf-id",
  NTLH: "your-ntlh-id",
  KJV: "de4e12af7f28f599-02",
  NIV: "your-niv-id",
};

const mockVerseTexts: Record<string, string> = {
  "João 3:16":
    "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.",
  "Gênesis 1:1": "No princípio criou Deus os céus e a terra.",
  "Salmo 23:1": "O Senhor é o meu pastor; nada me faltará.",
  "Filipenses 4:13": "Posso todas as coisas naquele que me fortalece.",
  "Mateus 11:28":
    "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos darei descanso.",
};

async function generateVerseText(reference: string, version: string): Promise<string> {
  const versionPrompt: Record<string, string> = {
    NVI: "Nova Versão Internacional (NVI) em português",
    ARA: "Almeida Revista e Atualizada (ARA) em português",
    ACF: "Almeida Corrigida e Fiel (ACF) em português",
    NTLH: "Nova Tradução na Linguagem de Hoje (NTLH) em português",
    KJV: "King James Version (KJV) in English",
    NIV: "New International Version (NIV) in English",
  };

  const prompt = `You are a Bible verse provider. Return ONLY the exact text of ${reference} from the ${versionPrompt[version] || version} Bible translation. Do not include the reference, just the verse text. Do not add any commentary or explanation. If the verse doesn't exist, respond with "NOT_FOUND".`;

  try {
    const { text } = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      prompt,
    });

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
        let verseText = mockVerseTexts[ref];

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