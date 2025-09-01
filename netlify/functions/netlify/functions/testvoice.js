// netlify/functions/testvoice.js
// Simple ElevenLabs voice test

const ELEVEN_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/";
const VOICE_ID = "vsvwsnYb6CY1kI3oTv5U"; // your chosen voice

exports.handler = async function () {
  const apiKey = process.env.ELEVEN_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "ELEVEN_API_KEY not set in Netlify" };
  }

  const resp = await fetch(`${ELEVEN_API_URL}${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "Hello, this is Donna speaking from the ElevenLabs test function.",
      model_id: "eleven_monolingual_v1"
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
    headers: { "Content-Type": "audio/mpeg" },
    body: b64,
    isBase64Encoded: true,
  };
};
