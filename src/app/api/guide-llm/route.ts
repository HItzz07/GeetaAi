export const runtime = "nodejs";

import gitaData from "@/data/gita.json";

type Verse = {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  english: string;
  english_alt: string;
};

type GuideResponse = {
  verse_sanskrit_english: string;
  translation: string;
  personalized_wisdom: string;
  reflection_question: string;
  metadata: {
    id: string;
    chapter: number;
    verse: number;
    topics: string;
    meaning: string;
  };
};

const STOPWORDS = new Set([
  "i", "me", "my", "the", "a", "an", "is", "am", "are", "was", "were", "be",
  "been", "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "to", "of", "in", "on", "at",
  "for", "with", "and", "or", "but", "if", "not", "that", "this", "it", "he",
  "she", "they", "we", "you", "what", "how", "why", "when", "where", "who",
  "feel", "feeling", "about", "just", "very", "really", "so", "much", "all",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function pickVerse(message: string): Verse {
  const verses = (gitaData as { verses: Verse[] }).verses;
  const queryTokens = tokenize(message);

  const fallback =
    verses.find((v) => v.id === "BG2.47") ?? verses[46];

  if (queryTokens.length === 0) return fallback;

  const querySet = new Set(queryTokens);
  let best = fallback;
  let bestScore = -1;

  for (const v of verses) {
    if (v.chapter === 1) continue;
    const vText = ((v.english ?? "") + " " + (v.english_alt ?? "")).toLowerCase();
    let score = 0;
    for (const t of querySet) {
      if (vText.includes(t)) score++;
    }
    // Boost wisdom-dense chapters
    if ([2, 6, 12, 18].includes(v.chapter)) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }

  return best;
}

async function callGroq(
  message: string,
  verse: Verse,
  language: string
): Promise<{
  personalized_wisdom: string;
  reflection_question: string;
  topics: string;
  meaning: string;
} | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_LLM_MODEL ?? "llama-3.3-70b-versatile";
  const isHindi = language === "Hindi";

  const system = isHindi
    ? "आप एक करुणामय परामर्शदाता हैं जो भगवद्गीता की ज्ञान से आधुनिक मनोवैज्ञानिक समझ को जोड़ते हैं। सरल, शांत, रोजमर्रा की हिंदी में जवाब दें — एक देखभाल करने वाले बड़े या करीबी दोस्त की तरह।"
    : "You are a deeply empathetic counselor blending modern mental health understanding with the wisdom of the Bhagavad Gita. Reply in warm, clear, soothing English — like a compassionate friend or wise elder.";

  const lang = isHindi ? "Hindi" : "English";

  const prompt =
    `Verse ${verse.id} (${verse.transliteration.slice(0, 80)}...):\n` +
    `"${verse.english}"\n\n` +
    `User shares: "${message}"\n\n` +
    `Respond ONLY in valid JSON in ${lang}:\n` +
    `{\n` +
    `  "personalized_wisdom": "2-4 paragraphs of warm, specific guidance connecting this verse to the user's situation",\n` +
    `  "reflection_question": "one gentle question to help the user reflect deeply",\n` +
    `  "topics": "comma-separated emotion/topic tags (e.g. anxiety, duty, peace)",\n` +
    `  "meaning": "one sentence meaning of this verse in context of the user's situation"\n` +
    `}`;

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        max_tokens: 900,
        temperature: 0.7,
      }),
    });
  } catch (err) {
    console.error("Groq network error:", err);
    return null;
  }

  if (!res.ok) {
    console.error("Groq error:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as {
      personalized_wisdom?: string;
      reflection_question?: string;
      topics?: string;
      meaning?: string;
    };
    if (!parsed.personalized_wisdom || !parsed.reflection_question) return null;
    return {
      personalized_wisdom: parsed.personalized_wisdom,
      reflection_question: parsed.reflection_question,
      topics: parsed.topics ?? "wisdom, life",
      meaning: parsed.meaning ?? verse.english.slice(0, 120),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text =
    body && typeof body.text === "string" ? body.text.trim() : "";
  const language =
    body && typeof body.language === "string" ? body.language : "English";

  if (!text) {
    return new Response("No message provided", { status: 400 });
  }

  const verse = pickVerse(text);
  const llm = await callGroq(text, verse, language);

  if (!llm) {
    return new Response(
      JSON.stringify({
        error: "LLM_FAILED",
        message: "Groq API call failed. Check GROQ_API_KEY env var.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const result: GuideResponse = {
    verse_sanskrit_english: `${verse.sanskrit} | ${verse.transliteration}`,
    translation: verse.english,
    personalized_wisdom: llm.personalized_wisdom,
    reflection_question: llm.reflection_question,
    metadata: {
      id: verse.id,
      chapter: verse.chapter,
      verse: verse.verse,
      topics: llm.topics,
      meaning: llm.meaning,
    },
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
