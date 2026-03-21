import { GoogleTranslateProvider } from './google';
import type { TranslationProvider } from './types';

export type { TranslationItem, TranslationProvider } from './types';

export function getProvider(apiKey: string): TranslationProvider {
	if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');
	return new GoogleTranslateProvider(apiKey);
}
