/* eslint-env mocha */
import assert from 'assert';
import { allowDropdownSourceValues } from '../../blocks/form/util.js';
import { createFormInstance } from '../../blocks/form/rules/model/afb-runtime.js';

// Country loads its options from a JSON source but still has the authored Item 1 / Item 2;
// Language is shown only for Canada (the Rule Editor "When country is equal to CA" rule).
const getFormDef = () => ({
  id: 'form1',
  fieldType: 'form',
  items: [
    {
      id: 'country',
      name: 'country',
      fieldType: 'drop-down',
      type: 'string',
      enum: ['0', '1'],
      enumNames: ['Item 1', 'Item 2'],
      enforceEnum: true,
      optionsSource: '/us/en/country-list.json',
      events: {
        change: ["if(country.$value == 'CA', dispatchEvent(language, 'custom:setProperty', {visible: true()}), dispatchEvent(language, 'custom:setProperty', {visible: false()}))"],
      },
    },
    {
      id: 'language',
      name: 'language',
      fieldType: 'drop-down',
      type: 'string',
      visible: false,
      enum: ['en', 'fr'],
      enumNames: ['English', 'French'],
      enforceEnum: true,
      events: { 'custom:setProperty': ['$event.payload'] },
    },
  ],
});

describe('allowDropdownSourceValues', () => {
  describe('Form definition', () => {
    it('should turn off the option check only for dropdowns with an options source', () => {
      const formDef = getFormDef();
      allowDropdownSourceValues(formDef);
      assert.strictEqual(formDef.items[0].enforceEnum, false);
      assert.strictEqual(formDef.items[1].enforceEnum, true);
    });

    it('should handle the legacy single-option source and nested :items panels', () => {
      const formDef = {
        fieldType: 'form',
        ':items': {
          panel: {
            fieldType: 'panel',
            ':items': {
              state: {
                fieldType: 'drop-down', enum: ['/us/en/state-list.json'], enforceEnum: true,
              },
            },
          },
        },
      };
      allowDropdownSourceValues(formDef);
      assert.strictEqual(formDef[':items'].panel[':items'].state.enforceEnum, false);
    });

    it('should save source values as text when "Save value as" is Number', () => {
      const formDef = getFormDef();
      formDef.items[0].type = 'number';
      formDef.items[1].type = 'number';
      const multi = {
        fieldType: 'drop-down', type: 'number[]', optionsSource: '/us/en/country-list.json',
      };
      formDef.items.push(multi);
      allowDropdownSourceValues(formDef);
      assert.strictEqual(formDef.items[0].type, 'string');
      assert.strictEqual(multi.type, 'string[]');
      // a dropdown with its own (authored) options keeps its type
      assert.strictEqual(formDef.items[1].type, 'number');
    });

    it('should ignore empty definitions', () => {
      assert.doesNotThrow(() => allowDropdownSourceValues(undefined));
      assert.doesNotThrow(() => allowDropdownSourceValues(null));
    });
  });

  describe('Form runtime', () => {
    it('should reject a source value while the authored options are enforced', () => {
      const form = createFormInstance(getFormDef());
      const country = form.getElement('country');
      country.value = 'CA';
      assert.notStrictEqual(country.validate().length, 0);
    });

    it('should accept a source value and still run the show / hide rule', () => {
      const formDef = getFormDef();
      allowDropdownSourceValues(formDef);
      const form = createFormInstance(formDef);
      const country = form.getElement('country');
      const language = form.getElement('language');

      country.value = 'CA';
      assert.strictEqual(country.validate().length, 0);
      assert.strictEqual(language.visible, true);

      country.value = 'US';
      assert.strictEqual(country.validate().length, 0);
      assert.strictEqual(language.visible, false);
    });
  });
});
