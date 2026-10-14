// Builds the side menu on every page, so the links live in one place.
// Paths are relative to the site root (where this file is).
const MENU = [
  ['Programming Ideas', [
    ['Recursion', 'index.html#recursion'],
    ['Memoization', 'ideas/memo.html'],
    ['Backtracking', 'ideas/backtracking.html'],
  ]],
  ['Complex Algorithms', [
    ['Overview', 'algorithms/index.html'],
    ['Longest Common Subsequence', 'algorithms/lcs.html'],
    ['N-Queens', 'algorithms/nqueens.html'],
  ]],
  ['Sorting Algorithms', [
    ['Bubble sort', 'sorting/index.html#bubble'],
    ['Selection sort', 'sorting/index.html#selection'],
    ['Insertion sort', 'sorting/index.html#insertion'],
    ['Merge sort', 'sorting/index.html#merge'],
    ['Quick sort', 'sorting/index.html#quick'],
  ]],
];

(() => {
  const root = new URL('.', document.currentScript.src);
  const nav = document.querySelector('nav.side');
  nav.innerHTML = `<p class="brand">O(<span>wow</span>)</p><p class="tagline">Hard CS ideas, animated.</p>` +
    MENU.map(([title, links]) => `<details open><summary>${title}</summary><ul>${
      links.map(([text, href]) => `<li><a href="${new URL(href, root).href}">${text}</a></li>`).join('')}</ul></details>`).join('');

  // Current page: same path, and same #tab (a page with no hash counts as its first tab).
  const path = u => u.pathname.replace(/index\.html$/, '');
  function mark() {
    const links = [...nav.querySelectorAll('a')], here = links.filter(a => path(a) === path(location));
    const cur = here.find(a => a.hash === location.hash) || here[0];
    links.forEach(a => a.toggleAttribute('aria-current', a === cur));
  }
  mark();
  addEventListener('hashchange', mark);
})();
