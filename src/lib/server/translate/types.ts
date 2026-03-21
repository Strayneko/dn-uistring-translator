export interface TranslationItem {
	id: number;
	text: string;
}

export interface TranslationProvider {
	translate(items: TranslationItem[]): Promise<TranslationItem[]>;
}
