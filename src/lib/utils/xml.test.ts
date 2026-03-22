import { describe, it, expect } from 'vitest';
import { extractCdata, substituteCdata, protectTags, restoreTags } from './xml';

// ---------------------------------------------------------------------------
// protectTags / restoreTags
// ---------------------------------------------------------------------------

describe('protectTags', () => {
	it('replaces a single opening+closing tag pair with placeholders', () => {
		const { text, tags } = protectTags('<font color="yellow">[H]</font>');
		expect(text).toBe('<x id="0"/>[H]<x id="1"/>');
		expect(tags).toEqual(['<font color="yellow">', '</font>']);
	});

	it('handles text with no tags', () => {
		const { text, tags } = protectTags('Hello world');
		expect(text).toBe('Hello world');
		expect(tags).toEqual([]);
	});

	it('handles multiple different tags', () => {
		const { text, tags } = protectTags('<b>bold</b> and <i>italic</i>');
		expect(text).toBe('<x id="0"/>bold<x id="1"/> and <x id="2"/>italic<x id="3"/>');
		expect(tags).toEqual(['<b>', '</b>', '<i>', '</i>']);
	});

	it('handles self-closing tags', () => {
		const { text, tags } = protectTags('line1<br/>line2');
		expect(text).toBe('line1<x id="0"/>line2');
		expect(tags).toEqual(['<br/>']);
	});

	it('preserves tags with spaced attributes exactly', () => {
		const { text, tags } = protectTags('<font color = "yellow" >[H]</font>');
		expect(text).toBe('<x id="0"/>[H]<x id="1"/>');
		expect(tags).toEqual(['<font color = "yellow" >', '</font>']);
	});
});

describe('restoreTags', () => {
	it('restores placeholders to original tags', () => {
		const result = restoreTags('<x id="0"/>[H]<x id="1"/>', ['<font color="yellow">', '</font>']);
		expect(result).toBe('<font color="yellow">[H]</font>');
	});

	it('is a no-op when there are no placeholders', () => {
		expect(restoreTags('Hello', [])).toBe('Hello');
	});

	it('replaces unknown placeholder index with empty string', () => {
		const result = restoreTags('<x id="5"/>text', ['<a>']);
		expect(result).toBe('text');
	});

	it('tolerates translator dropping the self-closing slash: <x id="0">', () => {
		const result = restoreTags('<x id="0">[H]<x id="1">', ['<font color="yellow">', '</font>']);
		expect(result).toBe('<font color="yellow">[H]</font>');
	});

	it('tolerates case-insensitive x tag from translator', () => {
		const result = restoreTags('<X id="0"/>text<X id="1"/>', ['<b>', '</b>']);
		expect(result).toBe('<b>text</b>');
	});

	it('strips malformed <x> tags the translator mangled beyond matching', () => {
		// Translator changed <x id="0"/> to <x id= "0"/> — not matched by main regex, cleaned up
		const result = restoreTags('<x id= "0"/>text<x id= "1"/>', ['<b>', '</b>']);
		expect(result).toBe('text');
	});

	it('strips bare </x> closing tags left by the translator', () => {
		const result = restoreTags('text</x>', ['<b>']);
		expect(result).toBe('text');
	});
});

describe('protectTags + restoreTags round-trip', () => {
	const cases = [
		'<font color = "yellow" >[H]</font>',
		'<b>damage:</b> <i>100</i>',
		'Normal text without tags',
		'<color=#FF0000>Red</color> and <color=#00FF00>Green</color>',
		'Attack +<font color="red">50</font> Defense -<font color="blue">30</font>',
		'<br/>newline here',
		'<html> text <br> more </html>',
	];

	for (const original of cases) {
		it(`round-trips: ${original}`, () => {
			const { text, tags } = protectTags(original);
			const restored = restoreTags(text, tags);
			expect(restored).toBe(original);
		});
	}
});

// ---------------------------------------------------------------------------
// extractCdata
// ---------------------------------------------------------------------------

describe('extractCdata', () => {
	it('extracts a single CDATA section', () => {
		const xml = '<root><![CDATA[Hello]]></root>';
		expect(extractCdata(xml)).toEqual([{ id: 0, text: 'Hello' }]);
	});

	it('extracts multiple CDATA sections in order', () => {
		const xml = '<r><![CDATA[First]]><![CDATA[Second]]></r>';
		expect(extractCdata(xml)).toEqual([
			{ id: 0, text: 'First' },
			{ id: 1, text: 'Second' },
		]);
	});

	it('extracts CDATA containing HTML tags intact', () => {
		const xml = '<r><![CDATA[<font color="yellow">[H]</font>]]></r>';
		expect(extractCdata(xml)).toEqual([
			{ id: 0, text: '<font color="yellow">[H]</font>' },
		]);
	});

	it('returns empty array when there are no CDATA sections', () => {
		expect(extractCdata('<root><child>text</child></root>')).toEqual([]);
	});

	it('preserves whitespace inside CDATA', () => {
		const xml = '<r><![CDATA[  spaced  ]]></r>';
		expect(extractCdata(xml)).toEqual([{ id: 0, text: '  spaced  ' }]);
	});

	it('extracts CDATA with multi-tag HTML content', () => {
		const xml = '<r><![CDATA[<html> <font color="yellow">[H]</font> text <br> </html>]]></r>';
		expect(extractCdata(xml)).toEqual([
			{ id: 0, text: '<html> <font color="yellow">[H]</font> text <br> </html>' },
		]);
	});
});

// ---------------------------------------------------------------------------
// substituteCdata
// ---------------------------------------------------------------------------

describe('substituteCdata', () => {
	it('substitutes a single CDATA section', () => {
		const xml = '<root><![CDATA[你好]]></root>';
		const result = substituteCdata(xml, [{ id: 0, text: 'Hello' }]);
		expect(result).toBe('<root><![CDATA[Hello]]></root>');
	});

	it('substitutes multiple CDATA sections independently', () => {
		const xml = '<r><![CDATA[第一]]><![CDATA[第二]]></r>';
		const result = substituteCdata(xml, [
			{ id: 0, text: 'First' },
			{ id: 1, text: 'Second' },
		]);
		expect(result).toBe('<r><![CDATA[First]]><![CDATA[Second]]></r>');
	});

	it('preserves surrounding XML structure exactly', () => {
		const xml = `<?xml version="1.0"?>\n<root attr="x"><child><![CDATA[text]]></child></root>`;
		const result = substituteCdata(xml, [{ id: 0, text: 'translated' }]);
		expect(result).toBe(`<?xml version="1.0"?>\n<root attr="x"><child><![CDATA[translated]]></child></root>`);
	});

	it('does not alter CDATA sections with no matching translation', () => {
		const xml = '<r><![CDATA[original]]></r>';
		const result = substituteCdata(xml, []);
		expect(result).toBe('<r><![CDATA[original]]></r>');
	});

	it('handles translated text containing HTML tags without breaking CDATA', () => {
		const xml = '<r><![CDATA[<font color="yellow">[H]</font>]]></r>';
		const result = substituteCdata(xml, [
			{ id: 0, text: '<font color="yellow">[H]</font>' },
		]);
		expect(result).toBe('<r><![CDATA[<font color="yellow">[H]</font>]]></r>');
	});

	it('handles length changes across multiple substitutions correctly', () => {
		const xml = '<r><![CDATA[短]]><![CDATA[短]]></r>';
		const result = substituteCdata(xml, [
			{ id: 0, text: 'much longer text here' },
			{ id: 1, text: 'b' },
		]);
		expect(result).toBe('<r><![CDATA[much longer text here]]><![CDATA[b]]></r>');
	});
});

// ---------------------------------------------------------------------------
// Full pipeline: extract → protect → simulate translation → restore → substitute
// ---------------------------------------------------------------------------

describe('full translation pipeline', () => {
	it('preserves XML structure and HTML tags inside CDATA after translation', () => {
		const xml = [
			'<?xml version="1.0" encoding="utf-8"?>',
			'<StringList>',
			'  <String id="1"><![CDATA[普通文字]]></String>',
			'  <String id="2"><![CDATA[<font color = "yellow" >[H]</font>攻击]]></String>',
			'  <String id="3"><![CDATA[伤害: <b>100</b>]]></String>',
			'</StringList>',
		].join('\n');

		const extracted = extractCdata(xml);
		expect(extracted).toHaveLength(3);
		expect(extracted[1].text).toBe('<font color = "yellow" >[H]</font>攻击');

		// Simulate: protect tags → translate text → restore tags
		const translated = extracted.map((item) => {
			const { text, tags } = protectTags(item.text);
			// Translator sees <x id="N"/> as HTML elements and preserves them,
			// only translating the surrounding Chinese text
			const out = text
				.replace('普通文字', 'Normal text')
				.replace('<x id="0"/>[H]<x id="1"/>攻击', '<x id="0"/>[H]<x id="1"/>Attack')
				.replace('伤害: <x id="0"/>100<x id="1"/>', 'Damage: <x id="0"/>100<x id="1"/>');
			return { id: item.id, text: restoreTags(out, tags) };
		});

		expect(translated[0].text).toBe('Normal text');
		expect(translated[1].text).toBe('<font color = "yellow" >[H]</font>Attack');
		expect(translated[2].text).toBe('Damage: <b>100</b>');

		const result = substituteCdata(xml, translated);
		expect(result).toContain('<![CDATA[Normal text]]>');
		expect(result).toContain('<![CDATA[<font color = "yellow" >[H]</font>Attack]]>');
		expect(result).toContain('<![CDATA[Damage: <b>100</b>]]>');
		expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
		expect(result).toContain('<String id="2">');
	});

	it('handles the multi-tag HTML CDATA case from the real bug report', () => {
		const cdataContent = ' <html> 使用<font color="yellow">[H]</font>键就能打开基本操作说明窗口。<br> </html> ';
		const xml = `<r><![CDATA[${cdataContent}]]></r>`;

		const extracted = extractCdata(xml);
		expect(extracted[0].text).toBe(cdataContent);

		const { text: protected_, tags } = protectTags(extracted[0].text);

		// All original tags must be replaced with <x id="N"/> placeholders
		expect(protected_).not.toMatch(/<font/);
		expect(protected_).not.toMatch(/<\/font>/);
		expect(protected_).not.toMatch(/<html/);
		expect(protected_).not.toMatch(/<br/);
		expect(protected_).toContain('<x id="0"/>');

		// Simulate: translator preserves <x> elements, translates Chinese
		const fakeTranslated = protected_.replace('使用', 'Use the ').replace('键就能打开基本操作说明窗口。', ' key to open the basic instructions window.');
		const restored = restoreTags(fakeTranslated, tags);

		// All original tags must be exactly restored
		expect(restored).toContain('<font color="yellow">');
		expect(restored).toContain('</font>');
		expect(restored).toContain('<html>');
		expect(restored).toContain('<br>');
		expect(restored).not.toContain('<x id=');
	});
});
