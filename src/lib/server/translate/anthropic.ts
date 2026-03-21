import Anthropic from '@anthropic-ai/sdk';
import type { TranslationItem, TranslationProvider } from './types';

const PROMPT = `You are translating game server message strings from Chinese to English.
Translate each item in the JSON array below. Keep the exact same structure and IDs.
Preserve newlines as-is. Do not add explanations or comments.
Return ONLY a valid JSON array.`;

export class AnthropicProvider implements TranslationProvider {
	private client: Anthropic;

	constructor(apiKey: string) {
		this.client = new Anthropic({ apiKey });
	}

	async translate(items: TranslationItem[]): Promise<TranslationItem[]> {
		const message = await this.client.messages.create({
			model: 'claude-haiku-4-5-20251001',
			max_tokens: 4096,
			messages: [{ role: 'user', content: `${PROMPT}\n\n${JSON.stringify(items, null, 2)}` }]
		});

		const raw = message.content[0].type === 'text' ? message.content[0].text : '';
		return parseJsonArray(raw);
	}
}

function parseJsonArray(raw: string): TranslationItem[] {
	const match = raw.match(/\[[\s\S]*\]/);
	if (!match) throw new Error('No JSON array found in response');
	return JSON.parse(match[0]);
}
