import type { TranslationItem, TranslationProvider } from './types';
import { withRetry } from './retry';

// DeepL free-tier keys end with ':fx'; paid keys use the standard endpoint.
const ENDPOINT_FREE = 'https://api-free.deepl.com/v2/translate';
const ENDPOINT_PAID = 'https://api.deepl.com/v2/translate';
const BATCH_SIZE = 50; // DeepL recommends ≤50 texts per request

export class DeepLProvider implements TranslationProvider {
	private apiKey: string;
	private endpoint: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		this.endpoint = apiKey.endsWith(':fx') ? ENDPOINT_FREE : ENDPOINT_PAID;
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
		const res = await fetch(this.endpoint, {
			method: 'POST',
			headers: {
				Authorization: `DeepL-Auth-Key ${this.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: items.map((i) => i.text),
				source_lang: 'ZH',
				target_lang: 'EN-US',
				tag_handling: 'html'
			})
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err?.message ?? `DeepL API error: ${res.status}`);
		}

		const data = await res.json();
		const translations: string[] = data.translations.map(
			(t: { text: string }) => t.text
		);

		return items.map((item, i) => ({ id: item.id, text: translations[i] }));
	}
}
