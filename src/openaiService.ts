import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export interface AIResponse {
  raw: string;
}

export class OpenAIService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = OPENAI_KEY;
    if (!this.apiKey) {
      // don't throw here — extension will show a message if missing at runtime
    }
  }

  async generate(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY not set in .env');

    const body = {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.2
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${txt}`);
    }

    const data = await res.json();
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);

    return { raw: text };
  }
}
