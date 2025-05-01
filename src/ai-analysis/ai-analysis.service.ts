import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

export type TranscriptInsights = {
  escalation: 'Low' | 'Medium' | 'High';
  csat: 'Positive' | 'Neutral' | 'Negative';
  vulnerable: boolean;
  redFlags: string[];
};

@Injectable()
export class AiAnalysisService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeTranscript(transcript: string): Promise<TranscriptInsights> {
    const prompt = `
You are an expert QA bot reviewing customer support conversations.

Here is the call transcript:
---
${transcript}
---

Analyze the conversation and return JSON like this:

{
  "escalation": "Low" | "Medium" | "High",
  "csat": "Positive" | "Neutral" | "Negative",
  "vulnerable": true | false,
  "redFlags": ["..."]
}

Strictly return only valid JSON. Do not add explanations or formatting.
    `.trim();

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message?.content || '{}';
    return JSON.parse(raw) as TranscriptInsights;
  }
}
