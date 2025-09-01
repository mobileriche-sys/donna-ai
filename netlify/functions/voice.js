// netlify/functions/voice.js
// OpenAI TTS function, locked to "verse" voice

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";

exports.handler = async function (event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: cors(), body: "" };
    }
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const { input } = JSON.parse(event.body || "{}");
    if (!input || !input.trim()) return json(400, { error: "Missing 'input' text." });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return json(500, { error: "OPENAI_API_KEY not set." });

    console.log("Donna TTS request → model=gpt-4o-mini-tts, voice=verse, input:", input);

    const resp = await fetch(OPENAI_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "serene",   // 🔒 force female voice
        input,
        format: "mp3",
      }),
    });

    if (!resp.ok) {
      const errText = await safeText(resp);
      console.error("OpenAI TTS error:", resp.status, errText);
      return json(resp.status, { error: `OpenAI: ${errText || resp.statusText}` });
    }

    const buf = await resp.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");

    return {
      statusCode: 200,
      headers: {
        ...cors(),
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
      body: b64,
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error("TTS function crashed:", e);
    return json(500, { error: e.message || String(e) });
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
function json(status, obj) {
  return {
    statusCode: status,
    headers: { ...cors(), "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}
async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}
