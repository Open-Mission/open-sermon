import { NextResponse } from "next/server";
import { getCached, bibleVerseCacheKey } from "@/lib/redis";

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
        const verseText =
          mockVerseTexts[ref] ||
          `[Texto do versículo ${ref} na versão ${version}]`;

        return {
          reference: ref,
          text: verseText,
          version: version,
        };
      },
      3600
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