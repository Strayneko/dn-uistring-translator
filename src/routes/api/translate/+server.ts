import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProvider } from '$lib/server/translate';
import type { TranslationItem } from '$lib/server/translate';
import { protectTags, restoreTags } from '$lib/utils/xml';

export const POST: RequestHandler = async ({ request }) => {
	const { items, filename, apiKey, provider: providerName = 'google', baseUrl } = await request.json() as {
		items: TranslationItem[];
		filename: string;
		apiKey: string;
		provider?: string;
		baseUrl?: string;
	};

	const keylessProviders = new Set(['google-free', 'libretranslate']);
	if (!apiKey && !keylessProviders.has(providerName)) {
		error(400, 'API key is required');
	}

	let provider;
	try {
		provider = getProvider(providerName, apiKey, baseUrl);
	} catch (e) {
		console.error('Provider init failed:', e);
		error(500, (e as Error).message);
	}

	if (!Array.isArray(items) || items.length === 0) {
		return json({ items: [] });
	}

	// Protect HTML tags inside each item so translators don't mangle them
	const tagStore: string[][] = [];
	const protectedItems = items.map((item) => {
		const { text, tags } = protectTags(item.text);
		tagStore.push(tags);
		return { ...item, text };
	});

	let translated: TranslationItem[];
	try {
		translated = await provider.translate(protectedItems);
	} catch (e) {
		const msg = `Translation failed for ${filename}: ${(e as Error).message}`;
		console.error(msg, e);
		error(500, msg);
	}

	// Restore original tags into the translated text
	const restoredItems = translated.map((item, i) => ({
		...item,
		text: restoreTags(item.text, tagStore[i] ?? [])
	}));

	return json({ items: restoredItems });
};
