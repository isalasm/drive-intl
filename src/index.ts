import * as fs from "fs";
import axios from "axios";
import { csvToJson } from "./utils";

type languajes = {
	[language: string]: string;
};

type Translation = {
	[token: string]: languajes;
};

type IntlServerType = {
	translations: Translation;
	sheet_id: string | null;
	translationsPath: string;
};

type IntlServerConfig = {
	sheet_id?: string;
	translationsPath?: string;
};

export default class IntlServer implements IntlServerType {
	private static instance: IntlServer;

	translations: Translation;
	sheet_id: string | null;
	translationsPath: string;

	constructor(config: IntlServerConfig) {
		try {
			this.sheet_id = config.sheet_id || null;
			this.translationsPath = config.translationsPath || "./translations.json";
			if (!fs.existsSync(this.translationsPath)) {
				fs.writeFileSync(this.translationsPath, "{}");
			}
			const translations = fs.readFileSync(this.translationsPath);
			this.translations = JSON.parse(translations.toString());
		} catch (error) {
			throw new Error(`Error reading translations: ${error}`);
		}
	}

	static init(config: IntlServerConfig): IntlServer {
		IntlServer.instance = new IntlServer(config);
		return IntlServer.instance;
	}

	static async get(): Promise<IntlServer> {
		let retries = 0;
		while (!IntlServer.instance && retries < 5) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			retries++;
		}
		if (!IntlServer.instance) {
			throw new Error("Failed to initialize IntlServer instance.");
		}
		return Promise.resolve(IntlServer.instance);
	}

	getSheetId() {
		return this.sheet_id;
	}

	updateTranslations(jsonData: any) {
		this.translations = { ...this.translations, ...jsonData };
		fs.writeFileSync(
			this.translationsPath,
			JSON.stringify(this.translations, null, 2),
		);
	}
}

export async function syncTranslations(): Promise<void> {
	const t = await IntlServer.get();
	if (t.sheet_id === null || t.sheet_id === undefined) {
		throw new Error("Missing sheet_id");
	}
	const response = await axios.get(
		`https://docs.google.com/spreadsheets/d/${t.sheet_id}/gviz/tq?tqx=out:csv&gid=0`,
	);
	const jsonData = csvToJson(response.data);
	t.updateTranslations(jsonData);
}

export async function translate(
	token: string,
	language: string,
): Promise<string | null> {
	const t = await IntlServer.get();
	const tokenObject = t.translations[token];
	if (!tokenObject) {
		console.warn(`Warn: token ${token} not found`);
		return Promise.resolve(null);
	}
	const translation = tokenObject[language];
	if (!translation) {
		console.warn(`Warn: language ${language} not found for token ${token}`);
		return Promise.resolve(null);
	}
	return Promise.resolve(translation);
}

export function getLanguageFromLocale(locale: string): string {
	const [language, _] = locale.split("-");
	return language;
}
