/* eslint-env mocha */
import assert from 'assert';
import sinon from 'sinon';
import { fetchDropdownSource } from '../../blocks/form/util.js';

const COUNTRIES = { total: 2, data: [{ Option: 'India', Value: 'IN' }, { Option: 'United States', Value: 'US' }] };
const ok = (json) => Promise.resolve({ ok: true, json: () => Promise.resolve(json) });

describe('fetchDropdownSource', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    window.dropdownSources = {};
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.dropdownSources = {};
  });

  describe('Caching', () => {
    it('should request the same source only once and share the result', async () => {
      global.fetch = sinon.stub().callsFake(() => ok(COUNTRIES));
      const first = await fetchDropdownSource('/us/en/country-list.json');
      const second = await fetchDropdownSource('/us/en/country-list.json');
      assert.strictEqual(global.fetch.callCount, 1);
      assert.deepStrictEqual(first, COUNTRIES);
      assert.strictEqual(second, first);
    });

    it('should share one request between dropdowns loading at the same time', async () => {
      global.fetch = sinon.stub().callsFake(() => ok(COUNTRIES));
      const results = await Promise.all([
        fetchDropdownSource('/us/en/country-list.json'),
        fetchDropdownSource('/us/en/country-list.json'),
        fetchDropdownSource('/us/en/country-list.json'),
      ]);
      assert.strictEqual(global.fetch.callCount, 1);
      results.forEach((r) => assert.deepStrictEqual(r, COUNTRIES));
    });

    it('should request different sources separately', async () => {
      global.fetch = sinon.stub().callsFake(() => ok(COUNTRIES));
      await fetchDropdownSource('/us/en/country-list.json');
      await fetchDropdownSource('/us/en/state-list.json');
      assert.strictEqual(global.fetch.callCount, 2);
    });
  });

  describe('Errors', () => {
    it('should resolve to an empty object when the source is not found', async () => {
      global.fetch = sinon.stub().resolves({ ok: false, status: 404, json: () => Promise.reject(new Error('not json')) });
      assert.deepStrictEqual(await fetchDropdownSource('/us/en/missing.json'), {});
    });

    it('should resolve to an empty object when the request fails', async () => {
      global.fetch = sinon.stub().rejects(new Error('network'));
      assert.deepStrictEqual(await fetchDropdownSource('/us/en/country-list.json'), {});
    });
  });
});
