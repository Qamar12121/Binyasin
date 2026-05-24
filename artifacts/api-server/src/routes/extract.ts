import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { requireAdmin, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

const AIRLINE_LOGOS: Record<string, string> = {
  "pia": "https://www.gstatic.com/flights/airline_logos/70px/PK.png",
  "pakistan international": "https://www.gstatic.com/flights/airline_logos/70px/PK.png",
  "airblue": "https://www.gstatic.com/flights/airline_logos/70px/ED.png",
  "flyjinnah": "https://www.gstatic.com/flights/airline_logos/70px/9P.png",
  "fly jinnah": "https://www.gstatic.com/flights/airline_logos/70px/9P.png",
  "sereneair": "https://www.gstatic.com/flights/airline_logos/70px/ER.png",
  "serene air": "https://www.gstatic.com/flights/airline_logos/70px/ER.png",
  "airsial": "https://www.gstatic.com/flights/airline_logos/70px/PF.png",
  "air sial": "https://www.gstatic.com/flights/airline_logos/70px/PF.png",
  "qatar airways": "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
  "emirates": "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
  "saudi airlines": "https://www.gstatic.com/flights/airline_logos/70px/SV.png",
  "saudia": "https://www.gstatic.com/flights/airline_logos/70px/SV.png",
  "flydubai": "https://www.gstatic.com/flights/airline_logos/70px/FZ.png",
  "fly dubai": "https://www.gstatic.com/flights/airline_logos/70px/FZ.png",
  "air arabia": "https://www.gstatic.com/flights/airline_logos/70px/G9.png",
};

function resolveAirlineLogo(name: string): string {
  const key = (name || "").toLowerCase().trim();
  for (const [k, v] of Object.entries(AIRLINE_LOGOS)) {
    if (key.includes(k)) return v;
  }
  return "";
}

// ── PACKAGES EXTRACT ──────────────────────────────────────────────────────────
const PACKAGE_SYSTEM_PROMPT = `You are an expert at reading Pakistani Umrah package brochures and extracting structured data.

Extract ALL Umrah packages from the provided text or image. Return a JSON object with key "packages" containing an array where each element is one package with these fields:

{
  "name": string,
  "tier": "economy"|"vip"|"luxury",
  "description": string,
  "duration": number,
  "hotel": string,
  "makkahHotel": string,
  "madinahHotel": string,
  "makkahNights": number|null,
  "madinahNights": number|null,
  "makkahHotelDistance": string,
  "madinahHotelDistance": string,
  "hotelStars": number,
  "transport": string,
  "visaIncluded": boolean,
  "price": number,
  "priceShared": number|null,
  "priceDouble": number|null,
  "priceTriple": number|null,
  "priceQuad": number|null,
  "currency": "PKR",
  "amenities": string[],
  "seatsAvailable": number|null,
  "originCity": string,
  "originCode": string,
  "destinationCode": string,
  "flightNumber": string,
  "returnFlightNumber": string,
  "travelDate": string,
  "returnDate": string,
  "departureTime": string,
  "arrivalTime": string,
  "returnTime": string,
  "returnArrivalTime": string,
  "baggage": string,
  "mealIncluded": boolean
}

Rules:
- Extract EVERY package you find
- Prices: convert to plain numbers (remove PKR, commas)
- Dates: use YYYY-MM-DD; assume year 2025 or 2026 if not given
- tier: "economy" for standard, "vip" for VIP/premium, "luxury" for luxury/5-star
- Missing fields: use "" for strings, null for numbers
- Return ONLY the JSON object, no markdown`;

// ── TICKETS EXTRACT ───────────────────────────────────────────────────────────
const TICKET_SYSTEM_PROMPT = `You are an expert at reading Pakistani airline group ticket / flight schedule brochures and extracting structured data.

Extract ALL group flight tickets from the provided text or image. Return a JSON object with key "tickets" containing an array where each element is one ticket with these fields:

{
  "airline": string,               // Full airline name e.g. "PIA (Pakistan Int'l)", "Airblue", "Emirates"
  "flightNumber": string,          // e.g. "PA-472" or "EK 612"
  "origin": string,                // City name e.g. "Lahore"
  "originCode": string,            // IATA code e.g. "LHE"
  "destination": string,           // City name e.g. "Jeddah"
  "destinationCode": string,       // IATA code e.g. "JED"
  "country": string,               // e.g. "Saudi Arabia", "UAE", "Qatar"
  "category": "KSA"|"UAE"|"Qatar", // Destination category
  "travelDate": string,            // YYYY-MM-DD
  "departureTime": string,         // e.g. "23:55"
  "arrivalTime": string,           // e.g. "03:15"
  "returnDate": string,            // YYYY-MM-DD or ""
  "returnFlightNumber": string,
  "returnTime": string,
  "returnArrivalTime": string,
  "baggage": string,               // e.g. "23 KG"
  "mealIncluded": boolean,
  "seatsAvailable": number,        // integer
  "totalSeats": number,            // integer, same as seatsAvailable if unknown
  "referenceCode": string,         // e.g. "AG-3116" or ""
  "price": number                  // PKR price as integer
}

Rules:
- Extract EVERY flight/ticket you find
- category: "KSA" for Saudi Arabia, "UAE" for Dubai/Abu Dhabi, "Qatar" for Qatar
- Dates: YYYY-MM-DD, assume year 2025 or 2026 if missing
- Times: 24-hour format HH:MM
- Prices: plain integer (no PKR, commas)
- Missing fields: "" for strings, 0 for numbers
- Return ONLY the JSON object, no markdown`;

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  type: string,
  content?: string,
  base64?: string,
  mimeType?: string
): Promise<any> {
  const openai = new OpenAI({ apiKey });

  let messages: any[];
  if (type === "text") {
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract all items from this text:\n\n${content}` },
    ];
  } else {
    const imgMime = mimeType || "image/jpeg";
    messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all items from this brochure image:" },
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
  return JSON.parse(raw);
}

// POST /api/packages/extract
router.post("/packages/extract", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: "OPENAI_API_KEY not configured. Please add it in Secrets." }); return; }

  const { type, content, base64, mimeType } = req.body;
  if (!type || (type === "text" && !content) || (type === "image" && !base64)) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  try {
    const parsed = await callOpenAI(apiKey, PACKAGE_SYSTEM_PROMPT, type, content, base64, mimeType);
    const packages = Array.isArray(parsed) ? parsed : (parsed.packages || parsed.data || [parsed]);
    res.json({ packages });
  } catch (err: any) {
    console.error("Package extract error:", err);
    res.status(500).json({ error: err?.message || "Extraction failed" });
  }
});

// POST /api/tickets/group/extract
router.post("/tickets/group/extract", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: "OPENAI_API_KEY not configured. Please add it in Secrets." }); return; }

  const { type, content, base64, mimeType } = req.body;
  if (!type || (type === "text" && !content) || (type === "image" && !base64)) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  try {
    const parsed = await callOpenAI(apiKey, TICKET_SYSTEM_PROMPT, type, content, base64, mimeType);
    const tickets: any[] = Array.isArray(parsed) ? parsed : (parsed.tickets || parsed.data || [parsed]);
    // auto-resolve airline logos server-side
    const enriched = tickets.map(t => ({
      ...t,
      airlineLogo: t.airlineLogo || resolveAirlineLogo(t.airline),
    }));
    res.json({ tickets: enriched });
  } catch (err: any) {
    console.error("Ticket extract error:", err);
    res.status(500).json({ error: err?.message || "Extraction failed" });
  }
});

export default router;
