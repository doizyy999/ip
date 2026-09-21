import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.APIKEY_GROQ!,
});

export const MODELS = {
  fast: "llama-3.1-8b-instant",
  smart: "llama-3.3-70b-versatile",
  coding: "qwen-2.5-coder-32b",
} as const;

export type ModelKey = keyof typeof MODELS;

export async function chatCompletion(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  model: ModelKey = "smart"
) {
  return groq.chat.completions.create({
    messages,
    model: MODELS[model],
    temperature: 0.7,
    max_tokens: 2048,
    stream: false,
  });
}

export async function streamChat(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  model: ModelKey = "smart"
) {
  return groq.chat.completions.create({
    messages,
    model: MODELS[model],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });
}
