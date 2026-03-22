import type { TranslationItem, TranslationProvider } from './types';
import { withRetry } from './retry';

const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
const BATCH_SIZE = 100; // Google Translate caps at 128 segments per request

export class GoogleTranslateProvider implements TranslationProvider {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async translate(items: TranslationItem[]): Promise<TranslationItem[]> {
		const results: TranslationItem[] = [];

		for (let i = 0; i < items.length; i += BATCH_SIZE) {
			const batch = items.slice(i, i + BATCH_SIZE);
			const translated = await withRetry(() => this.translateBatch(batch));
			results.push(...translated);
		}

		return results;
	}

	private async translateBatch(items: TranslationItem[]): Promise<TranslationItem[]> {
		const res = await fetch(`${ENDPOINT}?key=${this.apiKey}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				q: items.map((i) => i.text),
				source: 'zh',
				target: 'en',
				format: 'html'
			})
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err?.error?.message ?? `Google Translate API error: ${res.status}`);
		}

		const data = await res.json();
		const translations: string[] = data.data.translations.map(
			(t: { translatedText: string }) => t.translatedText
		);

		return items.map((item, i) => ({ id: item.id, text: translations[i] }));
	}
}
