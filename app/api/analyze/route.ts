import { chatCompletion } from "@/lib/groq";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";

const schema = z.object({
  type: z.enum(["profile", "timeline", "graph"]).optional(),
  data: z.unknown(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`analyze:${getIp(req)}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  const { type, data } = parsed.data;

  const prompts: Record<string, string> = {
    profile: `Analisis profil publik. Kasih: 1) Ringkasan, 2) Pola aktivitas, 3) Red flag, 4) Risk level, 5) Rekomendasi. Data: ${JSON.stringify(data)}`,
    timeline: `Analisis timeline. Kasih: 1) Pola waktu, 2) Anomali, 3) Insight. Data: ${JSON.stringify(data)}`,
    graph: `Analisis relationship graph. Kasih: 1) Cluster utama, 2) Node penting, 3) Insight. Data: ${JSON.stringify(data)}`,
  };

  try {
    const result = await chatCompletion(
      [
        { role: "system", content: "Kamu OSINT analyst. To the point." },
        { role: "user", content: (prompts[type ?? "profile"] ?? prompts.profile).slice(0, 12_000) },
      ],
      "fast"
    );
    return NextResponse.json({
      success: true,
      data: result.choices[0].message.content,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Groq error" },
      { status: 502 }
    );
  }
}
