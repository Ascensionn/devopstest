import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function generateDraft(input: {
  title: string;
  type: "important_date" | "follow_up";
  personName?: string | null;
  dueTiming: string;
  tone: "warm" | "casual" | "formal";
}) {
  if (!client) {
    return fallbackDraft(input);
  }

  const prompt = `Write one short ${input.tone} message.
Context: ${input.type.replace("_", " ")} called "${input.title}"${input.personName ? ` for ${input.personName}` : ""}.
Timing: ${input.dueTiming}.
Rules: 1-2 sentences. Natural tone. No emojis. No hashtags. Return only the message text.`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt,
    max_output_tokens: 120,
  });

  return response.output_text.trim();
}

function fallbackDraft(input: {
  title: string;
  personName?: string | null;
  dueTiming: string;
  tone: "warm" | "casual" | "formal";
}) {
  const person = input.personName ? `${input.personName}` : "you";
  if (input.tone === "formal") {
    return `Hello ${person}, just a quick note regarding ${input.title}. It is ${input.dueTiming}, and I wanted to follow up.`;
  }
  if (input.tone === "casual") {
    return `Hey ${person}, quick reminder about ${input.title} — it's ${input.dueTiming}.`;
  }
  return `Hi ${person}, just wanted to gently remind you about ${input.title}. It's ${input.dueTiming}.`;
}
