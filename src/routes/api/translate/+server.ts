import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProvider } from '$lib/server/translate';
import type { TranslationItem } from '$lib/server/translate';

export const POST: RequestHandler = async ({ request }) => {
	const { items, filename, apiKey, provider: providerName = 'google' } = await request.json() as {
		items: TranslationItem[];
		filename: string;
		apiKey: string;
		provider?: string;
	};

	if (!apiKey) {
		error(400, 'API key is required');
	}

	let provider;
	try {
		provider = getProvider(providerName, apiKey);
	} catch (e) {
		console.error('Provider init failed:', e);
		error(500, (e as Error).message);
	}

	if (!Array.isArray(items) || items.length === 0) {
		return json({ items: [] });
	}

	let translated: TranslationItem[];
	try {
		translated = await provider.translate(items);
	} catch (e) {
		const msg = `Translation failed for ${filename}: ${(e as Error).message}`;
		console.error(msg, e);
		error(500, msg);
	}

	return json({ items: translated });
};
