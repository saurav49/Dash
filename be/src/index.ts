require("dotenv").config();
import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  reactjsPrompt,
  getSystemPrompt,
  getTemplatePrompt,
  getUserPrompt,
  vuejsPrompt,
} from "./prompts/prompts";

const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());

const generateContent = async (prompt: string) => {
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
  }
};
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
    console.log({ templateType });
    if (templateType !== "react" && templateType !== "vue") {
      res.status(403).json({
        status: false,
        message: "Invalid template type",
      });
      return;
    }
    if (templateType === "react") {
      res.status(200).json({
        success: true,
        data: {
          ...reactjsPrompt,
        },
      });
      return;
    }
    if (templateType === "vue") {
      res.status(200).json({
        success: true,
        data: {
          ...vuejsPrompt,
        },
      });
      return;
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
