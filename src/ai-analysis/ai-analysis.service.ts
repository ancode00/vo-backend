// src/ai-analysis/ai-analysis.service.ts
import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

export type TranscriptInsights = {
  escalation: 'Low' | 'Medium' | 'High';
  csat: 'Positive' | 'Neutral' | 'Negative';
  vulnerable: boolean;
  redFlags: string[];
};

@Injectable()
export class AiAnalysisService {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = new OpenAIApi(configuration);
  }

  async analyzeTranscript(transcript: string): Promise<TranscriptInsights> {
    const prompt = `
You are an AI call quality auditor for a contact center.

Here is the transcript of a call between an agent and a customer:
---
${transcript}
---

Analyze the conversation and return JSON in the following format:

{
  "escalation": "Low" | "Medium" | "High",
  "csat": "Positive" | "Neutral" | "Negative",
  "vulnerable": true | false,
  "redFlags": ["..."]
}

Keep redFlags empty if none apply. Only return valid JSON.
`;

    const response = await this.openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const raw = response.data.choices[0].message?.content ?? '{}';
    return JSON.parse(raw) as TranscriptInsights;
  }
}
