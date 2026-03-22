import type { TranslationItem, TranslationProvider } from './types';
import { withRetry } from './retry';

export class LibreTranslateProvider implements TranslationProvider {
	private url: string;
	private apiKey: string;

	constructor(url: string, apiKey: string) {
		this.url = url;
		this.apiKey = apiKey;
	}

	async translate(items: TranslationItem[]): Promise<TranslationItem[]> {
		const results: TranslationItem[] = [];

		for (const item of items) {
			const result = await withRetry(() => this.translateOne(item));
			results.push(result);
		}

		return results;
	}

	private async translateOne(item: TranslationItem): Promise<TranslationItem> {
		const body: Record<string, string> = {
			q: item.text,
			source: 'zh',
			target: 'en',
			format: 'text'
		};
		if (this.apiKey) body.api_key = this.apiKey;
		body.format = 'html';

		const res = await fetch(this.url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err?.error ?? `LibreTranslate error: ${res.status}`);
		}

		const data = await res.json();
		return { id: item.id, text: data.translatedText };
	}
}
