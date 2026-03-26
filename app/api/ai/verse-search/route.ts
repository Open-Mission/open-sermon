import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

const VERSE_REFERENCE_PROMPT = `You are a Bible verse reference parser. Your task is to normalize user input into a standard Bible verse reference format.

Given a user's input (which may be in Portuguese, English, or Spanish), return ONLY a valid Bible verse reference in the standard format: "Book Chapter:Verse" or "Book Chapter:Verse-EndVerse" for ranges.

Examples:
- "joão 3 16" → "João 3:16"
- "john three sixteen" → "John 3:16"
- "genesis 1 1" → "Gênesis 1:1"
- "salmos 23" → "Salmos 23:1-6"
- "romanos 8 28 a 30" → "Romanos 8:28-30"
- "mt 5 1-12" → "Mateus 5:1-12"
- "salmo 91" → "Salmos 91"

If the input is unclear or doesn't appear to be a Bible reference, return "INVALID".

Return ONLY the reference, nothing else.`;

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: google('gemini-3.1-flash-lite-preview'),
      system: VERSE_REFERENCE_PROMPT,
      prompt: input.trim(),
    });

    const normalizedRef = text.trim();

    if (normalizedRef === 'INVALID' || !normalizedRef) {
      return NextResponse.json(
        { error: 'Could not parse verse reference', original: input },
        { status: 400 }
      );
    }

    return NextResponse.json({
      reference: normalizedRef,
      original: input,
    });
  } catch (error) {
    console.error('Error parsing verse reference:', error);
    return NextResponse.json(
      { error: 'Failed to parse verse reference' },
      { status: 500 }
    );
  }
}
