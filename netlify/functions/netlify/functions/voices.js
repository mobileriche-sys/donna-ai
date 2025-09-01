// netlify/functions/voices.js
// Lists all voices in your ElevenLabs account with IDs

const ELEVEN_API_URL = "https://api.elevenlabs.io/v1/voices";

exports.handler = async function () {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "ELEVEN_API_KEY not set in Netlify" };
    }

    const resp = await fetch(ELEVEN_API_URL, {
      headers: { "xi-api-key": apiKey }
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, body: errText };
    }

    const data = await resp.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data, null, 2)
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
