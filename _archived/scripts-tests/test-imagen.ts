import "dotenv/config";
import { put } from "@vercel/blob";

async function main() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    return;
  }
  if (!BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN");
    return;
  }

  const prompt = "A highly detailed futuristic cityscape at sunset";
  console.log("Generating image...");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Imagen API Error:", JSON.stringify(data));
      return;
    }

    if (data.predictions && data.predictions.length > 0) {
      const base64Data = data.predictions[0].bytesBase64Encoded;
      console.log("Successfully generated image. Uploading to Vercel Blob...");
      
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `hero-${Date.now()}.jpg`;
      const blob = await put(filename, buffer, {
        access: 'public',
        token: BLOB_READ_WRITE_TOKEN
      });
      
      console.log(`Image uploaded successfully: ${blob.url}`);
    } else {
      console.log("No predictions returned");
    }
  } catch (err) {
    console.error("Error generating or uploading image:", err);
  }
}

main();
