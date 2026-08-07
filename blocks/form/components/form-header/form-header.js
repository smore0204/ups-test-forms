import { stripTags } from '../../util.js';

function getText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function applyStyleProp(el, cssVar, value) {
  if (typeof value === 'string' && value.trim()) {
    el.style.setProperty(cssVar, value.trim());
  }
}

function getProp(fieldJson, key) {
  return fieldJson?.[key] ?? fieldJson?.properties?.[key];
}

export default async function decorate(element, fieldJson) {
  const title = getText(getProp(fieldJson, 'headerTitle'));
  const subtitle = getText(getProp(fieldJson, 'headerSubtitle'));

  element.classList.add('form-header-wrapper');

  const banner = document.createElement('div');
  banner.className = 'form-header-banner';

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'form-header-title';
    heading.innerHTML = stripTags(title);
    banner.append(heading);
  }

  if (subtitle) {
    const text = document.createElement('p');
    text.className = 'form-header-subtitle';
    text.innerHTML = stripTags(subtitle);
    banner.append(text);
  }

  applyStyleProp(banner, '--form-header-bg', getProp(fieldJson, 'headerBackgroundColor'));
  applyStyleProp(banner, '--form-header-color', getProp(fieldJson, 'headerTextColor'));
  applyStyleProp(banner, '--form-header-border-color', getProp(fieldJson, 'headerBorderColor'));
  applyStyleProp(banner, '--form-header-border-width', getProp(fieldJson, 'headerBorderWidth'));
  applyStyleProp(banner, '--form-header-border-style', getProp(fieldJson, 'headerBorderStyle'));
  applyStyleProp(banner, '--form-header-radius', getProp(fieldJson, 'headerBorderRadius'));
  applyStyleProp(banner, '--form-header-padding', getProp(fieldJson, 'headerPadding'));
  applyStyleProp(banner, '--form-header-align', getProp(fieldJson, 'headerTextAlign'));
  applyStyleProp(banner, '--form-header-title-size', getProp(fieldJson, 'headerTitleFontSize'));
  applyStyleProp(banner, '--form-header-subtitle-size', getProp(fieldJson, 'headerSubtitleFontSize'));
  applyStyleProp(banner, '--form-header-title-weight', getProp(fieldJson, 'headerTitleFontWeight'));
  applyStyleProp(banner, '--form-header-subtitle-weight', getProp(fieldJson, 'headerSubtitleFontWeight'));

  element.replaceChildren(banner);
  return element;
}
