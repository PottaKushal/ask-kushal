// Vercel serverless function: POST /api/chat
// Body: { messages: [{ role: "user"|"assistant", content: string }, ...] }
// Calls the Anthropic API with the grounding document as a system prompt, so
// every answer is anchored to Kushal's actual resume/project content rather
// than the model improvising.

const KNOWLEDGE = require("./knowledge");

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TURNS = 12; // basic guardrail on request size
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // requests per IP per window

// In-memory rate limiting. Resets on cold start, which is fine for a
// portfolio demo - the point is to stop obvious abuse, not to be bulletproof.
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const arr = (hits.get(ip) || []).filter((t) => t > windowStart);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT_MAX;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    res.status(429).json({
      error: "Too many requests - please wait a minute before asking more.",
    });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({
      error:
        "Server is missing ANTHROPIC_API_KEY. (If you're Kushal: add it in Vercel project settings -> Environment Variables.)",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (messages.length === 0) {
    res.status(400).json({ error: "No message provided." });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: KNOWLEDGE,
        messages,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("Anthropic API error", upstream.status, text);
      res.status(502).json({ error: "The AI backend had a hiccup. Try again in a moment." });
      return;
    }

    const data = await upstream.json();
    const reply =
      data?.content?.find((b) => b.type === "text")?.text ||
      "Sorry, I didn't get a usable response - try rephrasing?";

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong reaching the AI backend." });
  }
};
