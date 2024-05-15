# drive-intl

Simple way to manage translations using Google Sheet.

## Example usage
### Google Sheet
Create a google sheet with the following table.

|token|en|es|
|:-:|:-:|:-:|
|TEST_TOKEN|test|prueba|

The sheet must be public for anyone with the link. You will need the Google Sheet id, which you can find in the Google Sheet URL.

```console
https://docs.google.com/spreadsheets/d/GOOGLE_SHEET_ID/
```

### ESM example

Install the package

```console
npm install --save drive-intl
```
Initialize de translations, then you can call the methods for syncronization and translation.

```jsx
import IntlServer, {syncTranslations, translate} from 'drive-intl';

IntlServer.init({
    translationsPath: 'translationsFile.json',
    sheet_id: "googleSheetId"
});

async someFunction() {
    await syncTranslations() //sync local translationsFile.json with google sheet info.

    await translate('TEST_TOKEN', 'en') // returns: test
    await translate('TEST_TOKEN', 'es') // returns: prueba
}
someFunction()
```

## CommonJS example


```jsx
const driveIntl = require('drive-intl');

driveIntl.default.init({
    translationsPath: './translations.json',
    sheet_id: "1bGDVRDSJclxrHke5eWRc7NFHkx63FhLyXEXD9xynSLk"
});

async function someFunction(){
    await driveIntl.syncTranslations() //sync local translationsFile.json with google sheet info.

    await driveIntl.translate('TEST_TOKEN', 'en') // returns: test
    await driveIntl.translate('TEST_TOKEN', 'es') // returns: prueba
}


someAsyncFunction()
```

## Utils

If you need to extract the language from a locale you can use getLanguageFromLocale.

```jsx
const language = getLanguageFromLocale("en-US") // returns: en
```




