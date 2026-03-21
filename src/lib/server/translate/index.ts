import { GoogleTranslateProvider } from './google';
import { DeepLProvider } from './deepl';
import type { TranslationProvider } from './types';

export type { TranslationItem, TranslationProvider } from './types';

export function getProvider(provider: string, apiKey: string): TranslationProvider {
	if (!apiKey) throw new Error('API key is not configured');
	switch (provider) {
		case 'deepl':
			return new DeepLProvider(apiKey);
		case 'google':
		default:
			return new GoogleTranslateProvider(apiKey);
	}
}
