/* eslint-env mocha */
import assert from 'assert';
import { getDropdownSourceUrl } from '../../blocks/form/util.js';

const author = new URL('https://author-p139958-e1425834.adobeaemcloud.com/content/ups/us/en/country-list.html');
const live = new URL('https://main--ups-test-forms--smore0204.aem.live/us/en/forms/contact');
const local = new URL('http://localhost:3000/us/en/forms/contact');

describe('getDropdownSourceUrl', () => {
  describe('On AEM author', () => {
    it('should load a site path through the site .resource proxy', () => {
      assert.strictEqual(
        getDropdownSourceUrl('/us/en/country-list.json', author),
        '/content/ups.resource/us/en/country-list.json',
      );
    });

    it('should turn an authored AEM path into the .resource proxy path', () => {
      assert.strictEqual(
        getDropdownSourceUrl('/content/ups/us/en/country-list.json', author),
        '/content/ups.resource/us/en/country-list.json',
      );
    });

    it('should keep the site named in an authored AEM path', () => {
      assert.strictEqual(
        getDropdownSourceUrl('/content/ups-pt/fr/fr/country-list.json?sheet=fr', author),
        '/content/ups-pt.resource/fr/fr/country-list.json?sheet=fr',
      );
    });

    it('should leave a path that already uses the .resource proxy unchanged', () => {
      assert.strictEqual(
        getDropdownSourceUrl('/content/ups.resource/us/en/country-list.json', author),
        '/content/ups.resource/us/en/country-list.json',
      );
    });
  });

  describe('Outside AEM author', () => {
    it('should leave the authored path unchanged on aem.live', () => {
      assert.strictEqual(getDropdownSourceUrl('/us/en/country-list.json', live), '/us/en/country-list.json');
      assert.strictEqual(
        getDropdownSourceUrl('/content/ups/us/en/country-list.json', live),
        '/content/ups/us/en/country-list.json',
      );
    });

    it('should leave the authored path unchanged on localhost', () => {
      assert.strictEqual(getDropdownSourceUrl('/us/en/country-list.json', local), '/us/en/country-list.json');
    });
  });

  describe('Edge cases', () => {
    it('should leave full URLs, relative paths and DAM paths unchanged on author', () => {
      [
        'https://main--ups--aemsites.aem.live/us/en/country-list.json',
        '//cdn.example.com/list.json',
        './country-list.json',
        '/content/dam/ups/country-list.json',
      ].forEach((url) => assert.strictEqual(getDropdownSourceUrl(url, author), url));
    });

    it('should leave a site path unchanged on an author page outside /content/<site>', () => {
      const editorShell = new URL('https://author-p139958-e1425834.adobeaemcloud.com/ui');
      assert.strictEqual(getDropdownSourceUrl('/us/en/country-list.json', editorShell), '/us/en/country-list.json');
    });

    it('should return non-string values unchanged', () => {
      assert.strictEqual(getDropdownSourceUrl(undefined, author), undefined);
      assert.strictEqual(getDropdownSourceUrl(null, author), null);
    });
  });
});
