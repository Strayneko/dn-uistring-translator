import type { TranslationItem } from '$lib/types';

export function isValidXml(content: string): boolean {
	const doc = new DOMParser().parseFromString(content, 'text/xml');
	return doc.querySelector('parsererror') === null;
}

const TAG_RE = /<[^>]+>/g;

/**
 * Replaces all HTML/XML tags in `text` with XML-element placeholders like `<x id="0"/>`.
 * These look like HTML elements so translation APIs operating in HTML mode skip them entirely.
 * Returns the protected text and the original tags so they can be restored later.
 */
export function protectTags(text: string): { text: string; tags: string[] } {
	const tags: string[] = [];
	const protected_ = text.replace(TAG_RE, (match) => {
		const idx = tags.length;
		tags.push(match);
		return `<x id="${idx}"/>`;
	});
	return { text: protected_, tags };
}

/**
 * Restores tags previously extracted by `protectTags`.
 * Tolerates translators dropping the self-closing slash: `<x id="0">` is also accepted.
 * Any remaining `<x ...>` elements that the translator mangled beyond recognition are stripped.
 */
export function restoreTags(text: string, tags: string[]): string {
	const restored = text.replace(/<x\s+id="(\d+)"\s*\/?>/gi, (_, i) => tags[parseInt(i)] ?? '');
	return restored.replace(/<\/?x(\s[^>]*)?\/?>/gi, '');
}

export function extractCdata(xml: string): TranslationItem[] {
	const items: TranslationItem[] = [];
	const regex = /<!\[CDATA\[([\s\S]*?)\]\]>/g;
	let match;
	let id = 0;
	while ((match = regex.exec(xml)) !== null) {
		items.push({ id, text: match[1] });
		id++;
	}
	return items;
}

export function substituteCdata(xml: string, translations: TranslationItem[]): string {
	let result = xml;
	let offset = 0;
	const regex = /<!\[CDATA\[([\s\S]*?)\]\]>/g;
	const matches: Array<{ index: number; length: number; id: number }> = [];
	let match;
	let id = 0;
	while ((match = regex.exec(xml)) !== null) {
		matches.push({ index: match.index, length: match[0].length, id });
		id++;
	}
	for (const m of matches) {
		const t = translations.find((x) => x.id === m.id);
		if (!t) continue;
		const replacement = `<![CDATA[${t.text}]]>`;
		result =
			result.slice(0, m.index + offset) +
			replacement +
			result.slice(m.index + offset + m.length);
		offset += replacement.length - m.length;
	}
	return result;
}
