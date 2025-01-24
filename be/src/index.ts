require('dotenv').config();
import express from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from './prompts/prompts';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/generate-content', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const prompt = req.body.prompt;
  console.log({ prompt });
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: getSystemPrompt(),
    });

    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
