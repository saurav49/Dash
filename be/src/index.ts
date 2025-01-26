require("dotenv").config();
import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  chatPrompt,
  getSystemPrompt,
  getTemplatePrompt,
  getUserPrompt,
} from "./prompts/prompts";

const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

app.post("/generate-content", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: getSystemPrompt(),
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: getUserPrompt("dash-import-files"),
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: getUserPrompt("dash-prompt"),
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: getUserPrompt("user-content", prompt),
            },
          ],
        },
      ],
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
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
