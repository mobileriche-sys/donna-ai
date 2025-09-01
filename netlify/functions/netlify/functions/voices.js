// netlify/functions/voice.js
// ElevenLabs TTS for Donna — supports GET (quick test) and POST (normal use)

const ELEVEN_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/";
const DEFAULT_VOICE_ID = "Nhs7eitvQWFTQBsf0yiT"; // your chosen voice

exports.handler = async function (event) {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) return { statusCode: 500, body: "ELEVEN_API_KEY not set in Netlify" };

    const method = event.httpMethod;
    const qs = event.queryStringParameters || {};

    // Accept GET and POST only
    if (method !== "GET" && method !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    // Text to speak:
    // - GET: use default or ?text=...
    // - POST: require { input }
    let input = "Hello, this is Donna speaking from ElevenLabs.";
    if (method === "GET") {
      if (qs.text && String(qs.text).trim()) input = String(qs.text);
    } else {
      const data = JSON.parse(event.body || "{}");
      if (!data.input || !String(data.input).trim()) {
        return { statusCode: 400, body: "Missing 'input' text." };
      }
      input = String(data.input);
    }

    // Voice: allow override with ?voiceId=... for quick audition
    const voiceId = (qs.voiceId && qs.voiceId.trim()) || DEFAULT_VOICE_ID;

    const resp = await fetch(`${ELEVEN_API_URL}${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: input,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.55, similarity_boost: 0.75 },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, body: errText };
    }

    const buf = await resp.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Donna-Version": "GET-enabled" // <-- sanity marker
      },
      body: b64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
