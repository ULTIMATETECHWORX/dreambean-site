'use strict';

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  mainNav?.classList.remove('is-open');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  mainNav?.classList.toggle('is-open', open);
});
mainNav?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.nav-shell')) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

const paths = {
  garden: {
    kicker: 'For the little world-builder',
    title: 'A dreamer, a dreamworld, and a wonderful surprise.',
    description: 'Pick your hero, choose a magical setting, and add a twist. Dream Garden turns those story seeds into a four-chapter adventure.',
    idea: 'What if a tiny dragon delivered lanterns to a village in the clouds?',
  },
  jar: {
    kicker: 'For a wish from the heart',
    title: 'A little wish can become a wonderful story.',
    description: 'Share a dream or wish, choose a feeling, and add a gentle hope. Dream Jar keeps that meaning at the heart of the adventure.',
    idea: 'I wish I felt brave enough to sing, even when my voice is quiet.',
  },
  surprise: {
    kicker: 'For the delightfully unexpected',
    title: 'No idea yet? That is a lovely place to start.',
    description: 'Let Surprise Me choose the story ingredients. A new hero, a surprising world, and a playful twist are waiting to meet.',
    idea: 'A cheerful Moon robot, a baking experiment, and muffins that will not stop bouncing.',
  },
};
const tabs = [...document.querySelectorAll('.path-tab')];
function selectPath(tab, moveFocus = false) {
  const path = paths[tab.dataset.path];
  if (!path) return;
  for (const item of tabs) {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  }
  document.getElementById('path-kicker').textContent = path.kicker;
  document.getElementById('path-title').textContent = path.title;
  document.getElementById('path-description').textContent = path.description;
  document.getElementById('path-idea').textContent = path.idea;
  document.getElementById('path-panel').setAttribute('aria-labelledby', tab.id);
  if (moveFocus) tab.focus();
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectPath(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectPath(tabs[next], true);
    }
  });
}
