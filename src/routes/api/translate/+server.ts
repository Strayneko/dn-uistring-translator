import { env } from '$env/dynamic/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProvider } from '$lib/server/translate';
import type { TranslationItem } from '$lib/server/translate';

export const POST: RequestHandler = async ({ request }) => {
	let provider;
	try {
		provider = getProvider(env.GOOGLE_TRANSLATE_API_KEY ?? '');
	} catch (e) {
		console.error('Provider init failed:', e);
		error(500, (e as Error).message);
	}

	const { items, filename } = await request.json() as { items: TranslationItem[]; filename: string };
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
