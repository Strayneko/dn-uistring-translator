import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import { GoogleTranslateProvider } from './google';
import type { TranslationProvider } from './types';

export type { TranslationItem, TranslationProvider } from './types';

export type ProviderName = 'google' | 'anthropic' | 'openai';

export function getProvider(
	name: ProviderName,
	keys: { googleApiKey?: string; claudeApiKey?: string; openaiApiKey?: string }
): TranslationProvider {
	switch (name) {
		case 'google':
			if (!keys.googleApiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');
			return new GoogleTranslateProvider(keys.googleApiKey);
		case 'anthropic':
			if (!keys.claudeApiKey) throw new Error('CLAUDE_API_KEY is not configured');
			return new AnthropicProvider(keys.claudeApiKey);
		case 'openai':
			if (!keys.openaiApiKey) throw new Error('OPENAI_API_KEY is not configured');
			return new OpenAIProvider(keys.openaiApiKey);
		default:
			throw new Error(`Unknown translation provider: ${name}`);
	}
}
