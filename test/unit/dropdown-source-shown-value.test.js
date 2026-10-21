/* eslint-env mocha */
import assert from 'assert';
import { createDropdownUsingEnum } from '../../blocks/form/util.js';

// Country loads its options from a list. Without a placeholder or default value the browser shows
// the first option, so it is reported as a change (and submitted, like a picked value).
const countryList = { data: [{ Option: 'Canada', Value: 'CA' }, { Option: 'Mexico', Value: 'MX' }] };

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('Dropdown loaded from a list: shown option', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(countryList) });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const render = async (fd) => {
    const select = document.createElement('select');
    const changes = [];
    select.addEventListener('change', () => changes.push(select.value));
    createDropdownUsingEnum({
      id: 'country', name: 'country', fieldType: 'drop-down', optionsSource: '/us/en/country-list.json', ...fd,
    }, select);
    await flush();
    await flush();
    return { select, changes };
  };

  it('should report the shown first option when there is no placeholder or default value', async () => {
    const { select, changes } = await render({});
    assert.strictEqual(select.dataset.optionsSource, 'true');
    assert.strictEqual(select.value, 'CA');
    assert.deepStrictEqual(changes, ['CA']);
  });

  it('should not pick an option when the dropdown has a placeholder', async () => {
    const { select, changes } = await render({ placeholder: 'Select a country' });
    assert.strictEqual(select.value, '');
    assert.deepStrictEqual(changes, []);
  });

  it('should keep the default value without reporting a change', async () => {
    const { select, changes } = await render({ value: 'MX' });
    assert.strictEqual(select.value, 'MX');
    assert.deepStrictEqual(changes, []);
  });

  it('should not mark dropdowns with authored options', () => {
    const select = document.createElement('select');
    createDropdownUsingEnum({
      id: 'size', name: 'size', fieldType: 'drop-down', enum: ['s', 'm'], enumNames: ['Small', 'Medium'],
    }, select);
    assert.strictEqual(select.dataset.optionsSource, undefined);
  });
});
