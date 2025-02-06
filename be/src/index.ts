require("dotenv").config();
import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  designPrompt,
  getSystemPrompt,
  getTemplatePrompt,
} from "./prompts/prompts";
import {
  filePrompt as reactFilePrompt,
  userPrompt as reactUserPrompt,
} from "./prompts/reactPrompt";

const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

app.post("/template", async (req, res) => {
  try {
    const prompt = req.body.prompt;
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
        res.status(200).json({
          success: true,
          data: {
            prompt: {
              file: reactFilePrompt,
              design: designPrompt,
              content: reactUserPrompt(prompt),
            },
          },
        });
        return;
      case "vue":
        res.status(200).json({
          success: true,
          data: {
            type: "vue",
          },
        });
        return;
      default:
        res.status(403).json({
          status: false,
          message: "Invalid template type",
        });
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
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
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// const generateContent = async (prompt: string) => {
//   try {
//     const chat = model.startChat({
//       history: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: designSpecificationPrompt,
//             },
//           ],
//         },
//         {
//           role: "user",
//           parts: [
//             {
//               text: getUserPrompt("dash-prompt"),
//             },
//           ],
//         },
//         {
//           role: "user",
//           parts: [
//             {
//               text: getUserPrompt("user-content", prompt),
//             },
//           ],
//         },
//       ],
//     });
//     const result = await chat.sendMessageStream(``);
//     for await (const chunk of result.stream) {
//       const chunkText = chunk.text();
//       console.log(chunkText);
//     }
//   } catch (error: any) {
//     console.error(error.response?.data || error.message);
//   }
// };

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
