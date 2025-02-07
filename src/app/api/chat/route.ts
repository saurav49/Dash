import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "../../../../be/src/prompts/prompts";

export async function POST(req: Request) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  try {
    const { messages } = await req.json();
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: getSystemPrompt(),
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });
    const chat = model.startChat({
      history: messages,
    });
    const result = await chat.sendMessageStream(``);
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const message of result.stream) {
          const chunck = message.text();
          controller.enqueue(encoder.encode(chunck));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error });
  }
}
