// netlify/functions/voice.js
// ElevenLabs TTS function for Donna (locked to your chosen voice)

const ELEVEN_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/";
const VOICE_ID = "vsvwsnYb6CY1kI3oTv5U"; // your chosen female voice ID

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    const { input } = JSON.parse(event.body || "{}");
    if (!input || !input.trim()) {
      return { statusCode: 400, body: "Missing 'input' text." };
    }

    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "ELEVEN_API_KEY not set in Netlify" };
    }

    // Request speech from ElevenLabs
    const resp = await fetch(`${ELEVEN_API_URL}${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: input,
        model_id: "eleven_monolingual_v1", // English TTS model
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
        },
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
      },
      body: b64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};

