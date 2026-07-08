import "server-only";

const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate2";

export type TranslatableLocale = "hy" | "ru";

async function translateOne(text: string, target: TranslatableLocale, apiKey: string): Promise<string | null> {
  if (!text.trim()) return "";
  const res = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target, source: "en", format: "text" }),
  });
  if (!res.ok) {
    console.error(`[translate] Google Translate API error (${res.status}): ${await res.text()}`);
    return null;
  }
  const json = (await res.json()) as { data?: { translations?: { translatedText?: string }[] } };
  return json.data?.translations?.[0]?.translatedText ?? null;
}

export async function translateFields(
  fields: Record<string, string>,
  target: TranslatableLocale
): Promise<Record<string, string> | null> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.log(`[translate] GOOGLE_TRANSLATE_API_KEY not set — skipping auto-translate to "${target}".`);
    return null;
  }

  const keys = Object.keys(fields);
  const results = await Promise.all(keys.map((k) => translateOne(fields[k], target, apiKey)));
  if (results.some((r) => r === null)) return null;

  const out: Record<string, string> = {};
  keys.forEach((k, i) => {
    out[k] = results[i] as string;
  });
  return out;
}
