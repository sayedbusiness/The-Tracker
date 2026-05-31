/**
 * Avori OS — Vision: meal photo analysis via Google Gemini 2.5.
 *
 * Sends a base64 image to Gemini's multimodal endpoint and parses a
 * strict JSON response describing the meal. Falls back to a mock
 * estimate when GEMINI_API_KEY is unset.
 */

export interface MealAnalysis {
  name: string;
  ingredients: string[];
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  portion_estimate: string;
  confidence: number; // 0-1
  notes?: string;
}

const MOCK_MEAL: MealAnalysis = {
  name: "Grilled chicken bowl with rice, avocado and greens",
  ingredients: [
    "grilled chicken breast (~6 oz)",
    "white rice (~1 cup)",
    "avocado (1/2)",
    "mixed greens",
    "olive oil",
    "lime",
  ],
  meal_type: "lunch",
  calories: 720,
  protein_g: 58,
  carbs_g: 72,
  fat_g: 22,
  fiber_g: 9,
  portion_estimate: "1 large bowl, ~480g total",
  confidence: 0.92,
  notes: "Mock estimate. Set GEMINI_API_KEY in .env.local for real analysis.",
};

const PROMPT = `You are a precise nutrition analyst. Look at the meal photo and return STRICT JSON only — no markdown, no commentary.

Required schema:
{
  "name": string,                    // short descriptive name
  "ingredients": string[],           // each with rough portion in parens
  "meal_type": "breakfast"|"lunch"|"dinner"|"snack"|"drink",
  "calories": number,                // total kcal
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "portion_estimate": string,        // human-readable, e.g. "1 large bowl, ~450g"
  "confidence": number,              // 0..1
  "notes": string                    // optional caveats
}

Be honest about uncertainty — drop confidence if the photo is dark, partial, or ambiguous. Estimate portions from visual cues like plate size and density. Return ONLY the JSON.`;

export async function analyzeMealPhoto(
  imageBase64: string,
  mimeType: string
): Promise<MealAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return MOCK_MEAL;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const json = extractJson(raw);
  if (!json) throw new Error("Gemini returned no parseable JSON");

  return json;
}

const TEXT_PROMPT = `You are a precise nutrition analyst. Given a free-text description of a food (could be ingredients list copied from a package, a product name + brand, a barcode number, or a meal description) and an amount the user actually ate, return STRICT JSON only — no markdown, no commentary — for the amount eaten.

Required schema:
{
  "name": string,
  "ingredients": string[],
  "meal_type": "breakfast"|"lunch"|"dinner"|"snack"|"drink",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "portion_estimate": string,
  "confidence": number,
  "notes": string
}

For barcode numbers, look up the product if you recognize it; otherwise estimate from the ingredient list or product name. Lower confidence when uncertain. Return ONLY the JSON.`;

export async function analyzeMealText(
  text: string,
  amount: string
): Promise<MealAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ...MOCK_MEAL,
      name: `Estimated: ${text.slice(0, 60)}`,
      portion_estimate: amount || "as entered",
      notes: "Mock estimate. Set GEMINI_API_KEY for real macros.",
    };
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userMsg = `Food: ${text}\nAmount eaten: ${amount || "1 serving"}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${TEXT_PROMPT}\n\n${userMsg}` }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const json = extractJson(raw);
  if (!json) throw new Error("Gemini returned no parseable JSON");
  return json;
}

/**
 * Gemini occasionally wraps JSON in ```json fences or adds a brief
 * preamble. Extract the first balanced { ... } block.
 */
function extractJson(text: string): MealAnalysis | null {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as MealAnalysis;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as MealAnalysis;
    } catch {
      return null;
    }
  }
}
