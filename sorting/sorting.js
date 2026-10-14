// Shared sorting page: picks the sort from the #hash (the side menu links), input controls and the bar chart.
// Each sort file pushes { id, name, problem, code, run(a, step) } onto SORTS.
// run() sorts `a` (items {id, v}) in place and calls step({ line, why, state, hi, done, range, predict })
// at every moment worth showing; hi maps position -> highlight class.
const SORTS = [];
const MAX_N = 16;

addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const player = Player.mount({ root: $('app'), problem: '', inputs: `
    <label>Values <input id="vals" class="text wide" spellcheck="false" autocomplete="off" aria-describedby="vals-hint"></label>
    <label>Size <select id="size"></select></label>
    <button id="rand">Randomize</button>
    <small id="vals-hint">Type up to ${MAX_N} numbers from 1 to 99.</small>` });

  for (let n = 5; n <= MAX_N; n++) $('size').add(new Option(n, n, n === 8, n === 8));
  const current = () => SORTS.find(s => '#' + s.id === location.hash) || SORTS[0];
  const values = () => $('vals').value.split(/[\s,]+/).map(Number).filter(v => Number.isInteger(v) && v >= 1 && v <= 99).slice(0, MAX_N);

  function load() {
    const sort = current();
    document.querySelector('main > h1').textContent = sort.name;
    document.title = `O(wow) · ${sort.name}`;
    const a = values().map((v, id) => ({ id, v })), items = a.slice(), steps = [];
    sort.run(a, s => steps.push({ order: a.map(x => x.id), ...s }));
    player.load({ steps, code: sort.code, problem: sort.problem, vizTitle: sort.name, draw: draw(items, steps) });
  }

  // Bars are keyed by item, so a swap slides the two bars past each other.
  function draw(items, steps) {
    const max = Math.max(1, ...items.map(x => x.v));
    player.viz.innerHTML = `<div class="legend">${LEGEND}</div><div class="bars" style="--n:${items.length}"></div>`;
    const box = player.viz.querySelector('.bars');
    const bars = items.map(x => box.appendChild(Object.assign(document.createElement('div'), {
      className: 'bar', innerHTML: `<span>${x.v}</span>`, style: `height:${10 + 90 * x.v / max}%`,
    })));
    if (!items.length) box.innerHTML = '<p class="hint">Type some numbers or press Randomize.</p>';
    return k => {
      const s = steps[k];
      s.order.forEach((id, pos) => {
        bars[id].style.transform = `translateX(${pos * 100}%)`;
        bars[id].className = ['bar', s.hi?.[pos], s.done?.includes(pos) && 'done',
          s.range && (pos < s.range[0] || pos >= s.range[1]) && 'dim'].filter(Boolean).join(' ');
      });
    };
  }

  const LEGEND = [['cmp', 'comparing'], ['swap', 'moving'], ['pivot', 'pivot / minimum'], ['done', 'in final place']]
    .map(([c, t]) => `<span><i class="sw-${c}"></i>${t}</span>`).join('');

  $('rand').onclick = () => {
    $('vals').value = Array.from({ length: +$('size').value }, () => 5 + Math.floor(Math.random() * 95)).join(' ');
    load();
  };
  $('size').onchange = $('rand').onclick;
  $('vals').oninput = load;
  addEventListener('hashchange', load);
  $('rand').onclick();
});
