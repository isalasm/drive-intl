import * as fs from "fs";
import axios from "axios";

import IntlServer, { syncTranslations, translate } from "../src";

// Libraries Mocks
jest.mock("axios");
const mockedAxios = jest.mocked(axios);

jest.mock("fs");
const mockedFs = jest.mocked(fs);

beforeAll(() => {
	mockedFs.existsSync.mockReturnValue(true);
	mockedFs.readFileSync.mockReturnValue(
		'{"TEST_TOKEN": {"es": "Prueba", "en": "Test"}}',
	);
	IntlServer.init({
		translationsPath: "./translations.json",
		sheet_id: "someId",
	});
});

test("Translate existing token", async () => {
	const translation = await translate("TEST_TOKEN", "es");
	expect(translation).toBe("Prueba");
});

test("Translate missing token", async () => {
	const consoleLogMock = jest
		.spyOn(console, "warn")
		.mockImplementation(() => {});

	const translation = await translate("SOME_TOKEN", "es");

	expect(translation).toBe(null);
	expect(consoleLogMock).toHaveBeenCalledWith(
		"Warn: token SOME_TOKEN not found",
	);
});

test("Sync google sheet", async () => {
	const data =
		'"TOKEN","es","en"\n"SHEET_TOKEN","token de google sheet","google sheet token"';
	mockedAxios.get.mockResolvedValue({ data: data });

	await syncTranslations();
	// Check if the token was added to the translations
	const translation = await translate("SHEET_TOKEN", "es");

	expect(translation).toBe("token de google sheet");
	expect(mockedAxios.get).toHaveBeenCalledWith(
		"https://docs.google.com/spreadsheets/d/someId/gviz/tq?tqx=out:csv&gid=0",
	);
});
