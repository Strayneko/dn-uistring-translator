import { translate } from '@vitalets/google-translate-api';
import type { TranslationItem, TranslationProvider } from './types';

export class GoogleFreeProvider implements TranslationProvider {
	async translate(items: TranslationItem[]): Promise<TranslationItem[]> {
		const results: TranslationItem[] = [];

		for (const item of items) {
			const result = await translate(item.text, { from: 'zh', to: 'en' });
			results.push({ id: item.id, text: result.text });
		}

		return results;
	}
}
