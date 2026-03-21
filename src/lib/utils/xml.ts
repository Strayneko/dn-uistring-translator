import type { TranslationItem } from '$lib/types';

export function isValidXml(content: string): boolean {
	const doc = new DOMParser().parseFromString(content, 'text/xml');
	return doc.querySelector('parsererror') === null;
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
