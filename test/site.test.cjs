const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const text = html => html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

test('English and Spanish support is visible in hero, features, FAQ and search metadata', () => {
  const hero = index.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
  assert.match(text(hero), /English or Latin American Spanish/);
  assert.match(hero, /lang="es">Español \(Latinoamérica\)/);
  assert.match(index, /<meta name="description" content="[^"]*English and Latin American Spanish/);
  assert.match(index, /id="language-faq"/);
  assert.match(text(index), /Settings → Language/);
  assert.match(text(index), /changing the setting does not translate saved stories/);
  assert.match(text(index), /This website is currently in English/);
});

test('showcase gallery contains the four bundled stories with actual Nova artwork', () => {
  const gallery = index.match(/<section class="section showcase-section"[\s\S]*?<\/section>/)[0];
  assert.equal((gallery.match(/class="showcase-card"/g) || []).length, 4);
  assert.match(text(gallery), /Three English adventures and one Spanish adventure/);
  for (const title of ['Nova y el Reino de las Nubes Iluminadas', "Mossy's", "Beepbo's Bouncing", 'Momo and the Cloud']) {
    assert.ok(text(gallery).includes(title), title);
  }
  assert.doesNotMatch(gallery, /Lyra|showcase-lyra/);
  assert.match(gallery, /Spanish narration by Lily/);
  assert.match(gallery, /<h3 lang="es">Nova/);
  const image = fs.readFileSync(path.join(root, 'assets/showcase-nova.jpg'));
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('plans remove obsolete counts without advertising unlimited generation', () => {
  const pricing = text(index.match(/<section class="section pricing-section"[\s\S]*?<\/section>/)[0]);
  assert.doesNotMatch(pricing, /(?:20|40|80|160)\s+(?:new\s+)?(?:stories|AI illustrations|standard AI illustrations)/i);
  assert.doesNotMatch(pricing, /unlimited/i);
  assert.match(pricing, /monthly story, illustration, and narration allowances/);
  assert.match(pricing, /Plan details in the app before purchase/);
  for (const price of ['$3.99', '$9.99', '$72.99']) assert.ok(pricing.includes(price));
  const terms = text(read('terms-of-use.html'));
  assert.doesNotMatch(terms, /(?:20|40) stories|(?:80|160) AI illustrations/);
  assert.match(terms, /applicable allowances are shown in Subscription → Plan details/);
  assert.match(terms, /Illustration quality, narration quality, and selected voice can affect allowance usage/);
});

test('AI feature and privacy copy matches the current language, voice and reference-image flow', () => {
  assert.match(text(index), /five picture-book styles/);
  assert.match(text(index), /English or Spanish narrator with helpful accent labels/);
  const privacy = text(read('privacy-policy.html'));
  assert.match(privacy, /ElevenLabs: chapter text, story language/);
  assert.match(privacy, /Inworld:.*earlier app versions/);
  assert.match(privacy, /saved illustration may also be supplied to recover/);
  assert.match(privacy, /not included in story cloud sync/);
  assert.match(privacy, /three English stories and one Spanish story/);
  const terms = text(read('terms-of-use.html'));
  assert.match(terms, /ElevenLabs for narration in the current app/);
  assert.match(terms, /Inworld for narration in earlier app versions/);
});

test('local asset links, page links and anchors resolve', () => {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
    const html = read(file);
    for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      const value = match[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue;
      const [urlPath, fragment] = value.split('#');
      const target = path.resolve(root, (urlPath || file).split('?')[0]);
      assert.ok(target.startsWith(root + path.sep), value);
      assert.ok(fs.existsSync(target), file + ': ' + value);
      if (fragment && target.endsWith('.html')) {
        const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        assert.match(fs.readFileSync(target, 'utf8'), new RegExp('\\bid=["\\\']' + escaped + '["\\\']'), file + ': ' + value);
      }
    }
  }
});

function element(value = '') {
  return {
    value, dataset: {}, style: {}, attributes: {}, listeners: {}, tabIndex: 0,
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(type, callback) { this.listeners[type] = callback; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name]; },
    focus() { this.focused = true; },
  };
}

test('interactive creation tabs, keyboard navigation, menu and language help still work', () => {
  const nodes = Object.fromEntries(['path-kicker', 'path-title', 'path-description', 'path-idea', 'path-panel', 'language-faq'].map(id => [id, element()]));
  const tabs = ['garden', 'jar', 'surprise'].map(kind => ({ ...element(), id: 'tab-' + kind, dataset: { path: kind } }));
  const menu = element(); menu.attributes['aria-expanded'] = 'false';
  const nav = element(), language = element(), listeners = {};
  vm.runInNewContext(read('assets/site.js'), {
    document: {
      querySelector: selector => selector === '.menu-toggle' ? menu : nav,
      querySelectorAll: selector => selector === '.path-tab' ? tabs : [language],
      getElementById: id => nodes[id],
      addEventListener: (type, callback) => { listeners[type] = callback; },
    },
    window: { matchMedia: () => ({ addEventListener() {} }) },
  });
  tabs[1].listeners.click();
  assert.match(nodes['path-description'].textContent, /Dream Jar/);
  assert.equal(tabs[1].attributes['aria-selected'], 'true');
  tabs[1].listeners.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(tabs[2].focused, true);
  assert.match(nodes['path-description'].textContent, /Surprise Me/);
  menu.listeners.click();
  assert.equal(menu.attributes['aria-expanded'], 'true');
  listeners.keydown({ key: 'Escape' });
  assert.equal(menu.attributes['aria-expanded'], 'false');
  language.listeners.click();
  assert.equal(nodes['language-faq'].attributes.open, '');
});

function formFixture(file, values) {
  const nodes = {};
  const node = id => nodes[id] ??= element(values[id] || '');
  const radio = { ...element(), value: values.requestType || '' };
  const alerts = [];
  const window = { location: { href: '' } };
  const scripts = [...read(file).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
  vm.runInNewContext(scripts, {
    document: {
      getElementById: node,
      querySelector: () => radio.value ? radio : null,
      querySelectorAll: () => [],
    },
    window, alert: message => alerts.push(message),
    setTimeout: callback => callback(),
    fetch: () => assert.fail('Email forms must not send a request'),
  });
  return { nodes, alerts, window, submit: id => node(id).listeners.submit({ preventDefault() {} }) };
}

test('contact form prepares encoded email but never claims delivery or hides the form', () => {
  const form = formFixture('contact.html', { name: 'Parent', email: 'parent@example.com', message: 'English & español + voices?' });
  form.submit('contactForm');
  const email = new URL(form.window.location.href);
  assert.equal(email.protocol, 'mailto:');
  assert.ok(email.searchParams.get('body').includes('English & español + voices?'));
  assert.equal(form.nodes.successCard.style.display, 'block');
  assert.notEqual(form.nodes.formCard?.style.display, 'none');
  const html = text(read('contact.html'));
  assert.doesNotMatch(html, /Message sent!/);
  assert.match(html, /Nothing is sent by this website/);
  const invalid = formFixture('contact.html', { email: 'not-an-email', message: '' });
  invalid.submit('contactForm');
  assert.equal(invalid.window.location.href, '');
});

test('privacy request opens a draft without claiming receipt or confirmation', () => {
  const form = formFixture('data-request.html', { requestType: 'Deletion', fullName: 'Parent', email: 'parent@example.com', details: 'Please review my account.' });
  form.submit('dsarForm');
  const email = new URL(form.window.location.href);
  assert.match(email.searchParams.get('body'), /Data Request Type: Deletion/);
  assert.equal(form.nodes.successCard.style.display, 'block');
  assert.notEqual(form.nodes.formCard?.style.display, 'none');
  const html = text(read('data-request.html'));
  assert.doesNotMatch(html, /Request received|We've sent a confirmation/);
  assert.match(html, /has not sent the request or a confirmation email/);
  const invalid = formFixture('data-request.html', {});
  invalid.submit('dsarForm');
  assert.equal(invalid.window.location.href, '');
  assert.equal(invalid.alerts.length, 1);
});
