// Netlify Function to stream Donna's voice using OpenAI TTS
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "POST only" };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "Missing OPENAI_API_KEY" };
    }

    const { text, voice = "verse", speed = 0.96 } = JSON.parse(event.body || "{}");
    if (!text) {
      return { statusCode: 400, body: "Missing text input" };
    }

    const resp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,     // fixed to "verse" unless you override
        input: text,
        speed
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: 500, body: `OpenAI TTS error: ${errText}` };
    }

    const arrayBuffer = await resp.arrayBuffer();
    return {
      statusCode: 200,
      headers: { "Content-Type": "audio/mpeg" },
      body: Buffer.from(arrayBuffer).toString("base64"),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
}
