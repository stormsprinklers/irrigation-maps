import { STYLIZE_PROPERTY_PROMPT } from "@/lib/openai/prompts";

type StylizeResult = {
  imageBuffer: Buffer;
  mimeType: string;
};

export async function stylizePropertyImage(sourcePng: Buffer): Promise<StylizeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

  const formData = new FormData();
  formData.append("model", model);
  formData.append("prompt", STYLIZE_PROPERTY_PROMPT);
  formData.append("quality", "high");
  formData.append("size", "1024x1024");
  formData.append("output_format", "png");
  formData.append("background", "opaque");
  formData.append("input_fidelity", "high");
  formData.append(
    "image",
    new Blob([new Uint8Array(sourcePng)], { type: "image/png" }),
    "property-source.png"
  );

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI image generation failed (${res.status}): ${errorBody}`);
  }

  const data = (await res.json()) as {
    data?: { b64_json?: string }[];
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI returned no image data");
  }

  return {
    imageBuffer: Buffer.from(b64, "base64"),
    mimeType: "image/png",
  };
}
