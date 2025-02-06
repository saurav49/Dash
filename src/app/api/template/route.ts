import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getTemplatePrompt,
  designPrompt,
} from "../../../../be/src/prompts/prompts";

import {
  filePrompt as reactFilePrompt,
  userPrompt as reactUserPrompt,
} from "../../../../be/src/prompts/reactPrompt";

export async function POST(req: Request) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  try {
    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: getTemplatePrompt(),
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    const result = await model.generateContent(prompt);
    const templateType = result.response.text().toLowerCase().trim();
    switch (templateType) {
      case "react":
        return Response.json({
          success: true,
          data: {
            prompt: {
              file: reactFilePrompt,
              design: designPrompt,
              content: reactUserPrompt(prompt),
            },
          },
        });
      case "vue":
        return Response.json({
          success: true,
          data: {
            type: "vue",
          },
        });
      default:
        return Response.json({
          status: false,
          message: "Invalid template type",
        });
    }
  } catch (error) {
    return Response.json({
      success: false,
      error,
    });
  }
}
