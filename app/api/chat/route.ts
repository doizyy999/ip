import { streamChat, type ModelKey } from "@/lib/groq";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(4000),
      })
    )
    .max(20),
  model: z.enum(["fast", "smart", "coding"]).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`chat:${getIp(req)}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }

  const messages = [
    {
      role: "system" as const,
      content:
        "Kamu asisten OSINT analyst TRACE. Bantu analisis data publik, bikin laporan, cari pola. To the point, istilah teknis, no ceramah.",
    },
    ...parsed.data.messages,
  ];

  try {
    const stream = await streamChat(messages, (parsed.data.model as ModelKey) || "smart");
    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Groq error" },
      { status: 502 }
    );
  }
}
