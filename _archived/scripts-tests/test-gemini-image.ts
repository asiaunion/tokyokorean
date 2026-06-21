import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: "A highly detailed futuristic cityscape at sunset" }],
      parameters: { sampleCount: 1 }
    })
  });

  const data = await response.json();
  if (response.ok) {
    console.log("Success! Got image data:", Object.keys(data));
    if (data.predictions && data.predictions.length > 0) {
      console.log("Generated image base64 length:", data.predictions[0].bytesBase64Encoded.length);
    }
  } else {
    console.error("Failed:", JSON.stringify(data));
  }
}

main();
