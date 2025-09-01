export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Use POST" }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const { messages = [], temperature = 0.7, model = "gpt-4o-mini" } = body;

    const system = {
      role: "system",
      content: [
        "You are Donna AI — a confident, friendly live sales agent for MLGS + AI.",
        "Goals: greet, qualify, present the MLGS + AI system, handle objections, close the sale, and onboard.",
        "Tone: direct, encouraging, no fluff. Avoid emojis.",
        "Do not mention 'stacking' unless the user explicitly asks.",
        "Always move the conversation toward: 'Ready to get your 100 leads now?' and provide the signup link when asked."
      ].join(" ")
    };

    const payload = { model, temperature, messages: [system, ...messages].slice(-30) };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const t = await resp.text();
      return { statusCode: 500, body: JSON.stringify({ error: "OpenAI error", details: t }) };
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || "Server error" }) };
  }
}

