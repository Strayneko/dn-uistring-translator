import { GoogleTranslateProvider } from './google';
import { GoogleFreeProvider } from './googleFree';
import { DeepLProvider } from './deepl';
import { LibreTranslateProvider } from './libretranslate';
import type { TranslationProvider } from './types';

export type { TranslationItem, TranslationProvider } from './types';

const NO_KEY_PROVIDERS = new Set(['google-free', 'libretranslate']);

export function getProvider(provider: string, apiKey: string, baseUrl?: string): TranslationProvider {
	if (!NO_KEY_PROVIDERS.has(provider) && !apiKey) throw new Error('API key is not configured');
	switch (provider) {
		case 'google-free':
			return new GoogleFreeProvider();
		case 'libretranslate':
			return new LibreTranslateProvider(baseUrl ?? 'https://libretranslate.com/translate', apiKey);
		case 'deepl':
			return new DeepLProvider(apiKey);
		case 'google':
		default:
			return new GoogleTranslateProvider(apiKey);
	}
}
