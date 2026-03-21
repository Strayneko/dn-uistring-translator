import OpenAI from 'openai';
import type { TranslationItem, TranslationProvider } from './types';

const PROMPT = `You are translating game server message strings from Chinese to English.
Translate each item in the JSON array below. Keep the exact same structure and IDs.
Preserve newlines as-is. Do not add explanations or comments.
Return ONLY a valid JSON array.`;

export class OpenAIProvider implements TranslationProvider {
	private client: OpenAI;

	constructor(apiKey: string) {
		this.client = new OpenAI({ apiKey });
	}

	async translate(items: TranslationItem[]): Promise<TranslationItem[]> {
		const response = await this.client.chat.completions.create({
			model: 'gpt-4o-mini',
			max_tokens: 4096,
			messages: [
				{ role: 'system', content: PROMPT },
				{ role: 'user', content: JSON.stringify(items, null, 2) }
			]
		});

		const raw = response.choices[0]?.message?.content ?? '';
		return parseJsonArray(raw);
	}
}

function parseJsonArray(raw: string): TranslationItem[] {
	const match = raw.match(/\[[\s\S]*\]/);
	if (!match) throw new Error('No JSON array found in response');
	return JSON.parse(match[0]);
}
