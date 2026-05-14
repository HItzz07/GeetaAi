export const runtime = "nodejs";

type GuideLlmRequest = {
  message: string;
  language?: string;
  provider?: "ollama" | "groq" | "openai" | "anthropic";
};

type GuideLlmResponse = {
  emotion: string;
  topic: string;
  response: string;
  reflectionQuestion: string;
  passages: string[];
};

function buildSystemPrompt(language: string): string {
  if (language === "Hindi") {
    return (
      "You are a deeply empathetic counselor who blends modern mental health understanding with the wisdom of the Bhagavad Gita. " +
      "Reply entirely in simple, soothing, everyday Hindi — like a caring elder or close friend. Only occasional Sanskrit words allowed. " +
      "Weave in short Sanskrit shloka lines naturally. Respond calmly, with warmth and no judgment. " +
      "Keep response to 2–4 short paragraphs. End with one gentle Hindi reflection question. " +
      "Respond strictly in JSON as described by the user message."
    );
  }
  return (
    "You are a deeply empathetic counselor blending modern mental health understanding with the wisdom of the Bhagavad Gita. " +
    "Reply in warm, clear, soothing English — like a compassionate friend or wise elder. " +
    "Naturally weave in relevant Sanskrit shloka lines with their meaning. Respond calmly and non-judgmentally. " +
    "Keep response to 2–4 short paragraphs. End with one gentle English reflection question. " +
    "Respond strictly in JSON as described by the user message."
  );
}

function buildUserPrompt(payload: GuideLlmRequest, passages: string[]): string {
  const lang = payload.language === "Hindi" ? "Hindi" : "English";
  const contextBlock =
    passages.length > 0
      ? `Relevant Gita passages:\n\n${passages.map((p, i) => `(${i + 1}) ${p}`).join("\n\n")}\n\n`
      : "";
  return (
    contextBlock +
    `User's message: "${payload.message}"\n\n` +
    `Reply in ${lang}. Respond strictly in this JSON format (no extra text):\n` +
    '{\n  "emotion": "string",\n  "topic": "string",\n  "response": "string",\n  "reflectionQuestion": "string"\n}'
  );
}

async function callOllamaLlm(
  payload: GuideLlmRequest,
  passages: string[]
): Promise<GuideLlmResponse | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_LLM_MODEL || "llama3.2";

  const system = buildSystemPrompt(payload.language ?? "English");

  const userPrompt = buildUserPrompt(payload, passages);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch (err) {
    console.error("Ollama LLM network error:", err);
    return null;
  }

  if (!res.ok) {
    try {
      const errorBody = await res.text();
      console.error("Ollama LLM error:", res.status, errorBody);
    } catch {
      console.error("Ollama LLM error with unknown body", res.status);
    }
    return null;
  }

  const data = (await res.json()) as {
    message?: { content?: string };
  };

  const text =
    data.message && data.message.content ? data.message.content : null;

  if (!text) {
    return null;
  }

  let parsed: {
    emotion?: string;
    topic?: string;
    response?: string;
    reflectionQuestion?: string;
  };

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!parsed.response || !parsed.reflectionQuestion) {
    return null;
  }

  return {
    emotion: parsed.emotion || "Mixed",
    topic: parsed.topic || "Understanding your situation",
    response: parsed.response,
    reflectionQuestion: parsed.reflectionQuestion,
    passages,
  };
}

async function callOpenAiLlm(
  payload: GuideLlmRequest,
  passages: string[]
): Promise<GuideLlmResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_LLM_MODEL || "gpt-4o";

  const system = buildSystemPrompt(payload.language ?? "English");
  const userPrompt = buildUserPrompt(payload, passages);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    try {
      const errorBody = await res.text();
      console.error("OpenAI LLM error:", res.status, errorBody);
    } catch {
      console.error("OpenAI LLM error with unknown body", res.status);
    }
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content =
    data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
      ? data.choices[0].message.content
      : null;

  if (!content) {
    return null;
  }

  let parsed: {
    emotion?: string;
    topic?: string;
    response?: string;
    reflectionQuestion?: string;
  };

  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  if (!parsed.response || !parsed.reflectionQuestion) {
    return null;
  }

  return {
    emotion: parsed.emotion || "Mixed",
    topic: parsed.topic || "Understanding your situation",
    response: parsed.response,
    reflectionQuestion: parsed.reflectionQuestion,
    passages,
  };
}

async function callGroqLlm(
  payload: GuideLlmRequest,
  passages: string[]
): Promise<GuideLlmResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.GROQ_LLM_MODEL || "llama-3.3-70b-versatile";

  const system = buildSystemPrompt(payload.language ?? "English");
  const userPrompt = buildUserPrompt(payload, passages);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    try {
      const errorBody = await res.text();
      console.error("Groq LLM error:", res.status, errorBody);
    } catch {
      console.error("Groq LLM error with unknown body", res.status);
    }
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content =
    data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
      ? data.choices[0].message.content
      : null;

  if (!content) {
    return null;
  }

  let parsed: {
    emotion?: string;
    topic?: string;
    response?: string;
    reflectionQuestion?: string;
  };

  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  if (!parsed.response || !parsed.reflectionQuestion) {
    return null;
  }

  return {
    emotion: parsed.emotion || "Mixed",
    topic: parsed.topic || "Understanding your situation",
    response: parsed.response,
    reflectionQuestion: parsed.reflectionQuestion,
    passages,
  };
}

async function callAnthropicLlm(
  payload: GuideLlmRequest,
  passages: string[]
): Promise<GuideLlmResponse | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.ANTHROPIC_LLM_MODEL || "claude-3-5-sonnet-20241022";

  const system = buildSystemPrompt(payload.language ?? "English");
  const userPrompt = buildUserPrompt(payload, passages);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      system,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    try {
      const errorBody = await res.text();
      console.error("Anthropic LLM error:", res.status, errorBody);
    } catch {
      console.error("Anthropic LLM error with unknown body", res.status);
    }
    return null;
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };

  const first =
    data.content && data.content.length > 0 ? data.content[0] : null;
  const text = first && first.type === "text" ? first.text : null;

  if (!text) {
    return null;
  }

  let parsed: {
    emotion?: string;
    topic?: string;
    response?: string;
    reflectionQuestion?: string;
  };

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!parsed.response || !parsed.reflectionQuestion) {
    return null;
  }

  return {
    emotion: parsed.emotion || "Mixed",
    topic: parsed.topic || "Understanding your situation",
    response: parsed.response,
    reflectionQuestion: parsed.reflectionQuestion,
    passages,
  };
}

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as GuideLlmRequest | null;

  const message =
    body && typeof body.message === "string" ? body.message.trim() : "";
  const language =
    body && typeof body.language === "string" ? body.language : "English";
  const provider =
    body && typeof body.provider === "string" ? body.provider : "ollama";

  if (!message) {
    return new Response("No message provided", { status: 400 });
  }

  const passageTexts: string[] = [];
  const req: GuideLlmRequest = { message, language, provider };

  let result: GuideLlmResponse | null = null;

  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasOpenAi = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  if (provider === "groq" && hasGroq) {
    result = await callGroqLlm(req, passageTexts);
  } else if (provider === "openai" && hasOpenAi) {
    result = await callOpenAiLlm(req, passageTexts);
  } else if (provider === "anthropic" && hasAnthropic) {
    result = await callAnthropicLlm(req, passageTexts);
  } else {
    result = await callOllamaLlm(req, passageTexts);
    if (!result && hasGroq) {
      result = await callGroqLlm(req, passageTexts);
    }
    if (!result && hasOpenAi) {
      result = await callOpenAiLlm(req, passageTexts);
    }
    if (!result && hasAnthropic) {
      result = await callAnthropicLlm(req, passageTexts);
    }
  }

  if (!result) {
    return new Response(
      JSON.stringify({
        error: "LLM_CALL_FAILED",
        message:
          "Tried contacting the LLM providers, but the calls failed. Please check API keys and network.",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
