export type FileStatus = 'pending' | 'in-progress' | 'done' | 'error';

export type XmlFile = {
	name: string;
	lines: number;
	totalStrings: number;
	translatedStrings: number;
	status: FileStatus;
	errorMsg?: string;
};

export interface TranslationItem {
	id: number;
	text: string;
}
