import { NextResponse } from "next/server";
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { cached } from "@/lib/cache";
import type { PhoneIntel } from "@/types";

const schema = z.object({
  query: z.string().min(7).max(25),
  country: z.string().length(2).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`phone:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Nomor invalid" }, { status: 400 });

  const input = parsed.data.query.trim();

  const data = await cached(`phone:${input}`, 3600_000, async (): Promise<PhoneIntel> => {
    const phone = parsePhoneNumberFromString(
      input.startsWith("+") ? input : input,
      (parsed.data.country as never) ?? "ID"
    );
    const notes: string[] = [];
    if (!phone || !phone.isValid()) {
      return { input, valid: false, notes: ["Nomor tidak valid / tidak bisa diparse"] };
    }
    const e164 = phone.number;
    const intl = phone.formatInternational();
    const nat = phone.formatNational();
    const country = phone.country;
    const type = phone.getType() ?? "UNKNOWN";
    notes.push("Cek WhatsApp/Telegram dilakukan manual via link (hindari ToS violation).");
    notes.push("TRACE tidak menampilkan nama pemilik, alamat, atau NIK.");
    return {
      input, valid: true, e164, international: intl, national: nat,
      country, countryCode: phone.countryCallingCode,
      nationalNumber: phone.nationalNumber, type,
      whatsappUrl: `https://wa.me/${e164.replace("+", "")}`,
      telegramUrl: `https://t.me/+${e164.replace("+", "")}`,
      notes,
    };
  });

  return NextResponse.json({ success: true, data });
}
