import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { requireAdmin, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert at reading Pakistani Umrah package brochures and extracting structured data.

Extract ALL Umrah packages from the provided text or image. Return a JSON array where each element is one package with these fields:

{
  "name": string,           // e.g. "Economy Umrah 21 Days" or "SHAB-E-QADR UMRAH PACKAGE"
  "tier": "economy"|"vip"|"luxury",
  "description": string,    // Short summary
  "duration": number,       // Total days as integer
  "hotel": string,          // General hotel description or fallback
  "makkahHotel": string,    // Makkah hotel name (e.g. "HARIS / ZAID AL BAIT OR SIMILAR")
  "madinahHotel": string,   // Madinah hotel name
  "makkahNights": number,   // Nights in Makkah (integer)
  "madinahNights": number,  // Nights in Madinah (integer)
  "makkahHotelDistance": string,   // e.g. "800m from Haram"
  "madinahHotelDistance": string,  // e.g. "900m from Haram"
  "hotelStars": number,     // 3, 4, or 5
  "transport": string,      // e.g. "JED-MAK-MAD-MAK-JED"
  "visaIncluded": boolean,
  "price": number,          // Base/minimum price in PKR (integer, no commas)
  "priceShared": number|null,
  "priceDouble": number|null,
  "priceTriple": number|null,
  "priceQuad": number|null,
  "currency": "PKR",
  "amenities": string[],    // Array of included items
  "seatsAvailable": number|null,
  "originCity": string,     // e.g. "Lahore" or "Karachi"
  "originCode": string,     // IATA code e.g. "LHE"
  "destinationCode": string, // Usually "JED"
  "flightNumber": string,
  "returnFlightNumber": string,
  "travelDate": string,     // ISO date "YYYY-MM-DD" or empty string
  "returnDate": string,     // ISO date "YYYY-MM-DD" or empty string
  "departureTime": string,  // e.g. "23:55"
  "arrivalTime": string,
  "returnTime": string,
  "returnArrivalTime": string,
  "baggage": string,        // e.g. "20 KG" or "23 KG"
  "mealIncluded": boolean
}

Rules:
- Extract EVERY package you find, even if details are partial
- For prices: convert to numbers (remove PKR, commas, spaces) — if only one price given use it as "price"
- For tier: "economy" for standard packages, "vip" for premium/VIP, "luxury" for luxury/5-star
- Dates: use YYYY-MM-DD format; if year not given assume 2025 or 2026
- If a field is unknown or missing, use empty string "" for strings and null for numbers
- mealIncluded: true if "meal" or "meals" mentioned
- visaIncluded: true if "visa" mentioned as included
- Return ONLY valid JSON array, no markdown, no explanation`;

router.post("/packages/extract", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "OPENAI_API_KEY not configured. Please add it in Secrets." });
    return;
  }

  const { type, content, base64, mimeType } = req.body;

  if (!type || (type === "text" && !content) || (type === "image" && !base64)) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });

    let messages: any[];

    if (type === "text") {
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Extract all Umrah packages from this text:\n\n${content}` },
      ];
    } else {
      const imgMime = mimeType || "image/jpeg";
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all Umrah packages from this brochure image:" },
            { type: "image_url", image_url: { url: `data:${imgMime};base64,${base64}`, detail: "high" } },
          ],
        },
      ];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      res.status(500).json({ error: "AI returned invalid JSON", raw });
      return;
    }

    const packages = Array.isArray(parsed) ? parsed : (parsed.packages || parsed.data || [parsed]);
    res.json({ packages });
  } catch (err: any) {
    console.error("Extract error:", err);
    res.status(500).json({ error: err?.message || "Extraction failed" });
  }
});

export default router;
