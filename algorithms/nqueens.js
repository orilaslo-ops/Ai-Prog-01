// N-Queens: backtracking search for the first solution, plus a gallery of all solutions.
const player = Player.mount({
  title: 'N-Queens <span>Backtracking</span>',
  problem: `Place N chess queens on an N×N board so that no two attack each other: no shared row, column or diagonal.
    Trying every arrangement is hopeless (over 4 billion for N = 8). Backtracking builds a solution one row at a time,
    and the moment a row has no safe square it undoes the most recent choice and tries the next option, cutting off
    every arrangement that starts with that mistake.`,
  inputs: `
    <label>N <select id="n"></select></label>
    <button id="all">Find all solutions</button>`,
});

const $ = id => document.getElementById(id);
for (let n = 4; n <= 10; n++) $('n').add(new Option(n, n, n === 6, n === 6));

const CODE = [
  'solve(row):',
  '  if row == N: return true   # all queens placed',
  '  for col in 0..N-1:',
  '    if safe(row, col):',
  '      place queen at (row, col)',
  '      if solve(row + 1): return true',
  '      remove queen   # backtrack',
  '  return false   # dead end',
];

const attackers = (q, r, c) => q.map((qc, qr) => [qr, qc]).filter(([qr, qc]) => qc === c || Math.abs(qc - c) === Math.abs(qr - r));
const safeCols = (q, r, N, from = 0) => [...Array(N).keys()].filter(c => c >= from && !attackers(q, r, c).length);
const colList = cs => cs.map(c => c + 1).join(', ');

function load() {
  $('gallery')?.remove();
  const N = +$('n').value;
  const q = [], steps = [], root = { id: 0, row: -1, kids: [] }, nodes = [root];
  let placed = 0, backs = 0, path = [root];
  const push = s => steps.push({ q: q.slice(), path: path.slice(), state: { N, row: s.row === undefined ? '—' : s.row + 1, 'queens on board': q.length, 'placements tried': placed, backtracks: backs }, ...s });

  push({ line: 0, why: `One queen must go in each row, so the search places them row by row, always taking the leftmost safe square. Red squares are attacked by queens already on the board.` });

  // Decide row r starting from column `from`; the predict question asks the same choice.
  const options = [...Array(N).keys()].map(c => `Column ${c + 1}`).concat('Nowhere: dead end');
  (function solve(r, from = 0) {
    if (r === N) return true;
    for (let c = from; c < N; c++) {
      if (attackers(q, r, c).length) continue;
      const skipped = [...Array(c - from).keys()].map(k => k + from);
      q.push(c); placed++;
      const node = { id: nodes.length, row: r, col: c, parent: path.at(-1), kids: [] };
      nodes.push(node); node.parent.kids.push(node); path.push(node);
      const why = `Row ${r + 1}: ` + (skipped.length ? `column${skipped.length > 1 ? 's' : ''} ${colList(skipped)} ${skipped.length > 1 ? 'are' : 'is'} attacked, so ` : '') +
        `column ${c + 1} is the first safe square. Place the queen there and move on to row ${r + 2 > N ? '(none, done)' : r + 2}.`;
      push({ line: 4, row: r, cur: [r, c], node, why, predict: { question: `Row ${r + 1}${from ? ` (trying columns after ${from})` : ''}: where does the queen go?`, options, answer: `Column ${c + 1}` } });
      if (solve(r + 1)) return true;
      q.pop(); path.pop(); backs++; node.dead = true;
      const rest = safeCols(q, r, N, c + 1);
      push({ line: 6, row: r, removed: [r, c], node, why: `Undo: remove the queen from row ${r + 1}, column ${c + 1}. Every arrangement below it failed, so row ${r + 1} tries the next column to the right` + (rest.length ? ` (column ${rest[0] + 1} is safe).` : `, but none of them are safe either.`) });
      return solve(r, c + 1);
    }
    if (r === 0) return false;
    push({ line: 7, row: r, dead: r, why: `Dead end in row ${r + 1}: every square ${from ? `from column ${from + 1} on ` : ''}is attacked. No queen fits, so the choice in row ${r} must have been wrong. Backtrack.`,
      predict: { question: `Row ${r + 1}${from ? ` (trying columns after ${from})` : ''}: where does the queen go?`, options, answer: options.at(-1) } });
    return false;
  })(0);

  push({ line: 1, row: N - 1, solved: true, why: `All ${N} queens are placed and none attack each other. Solved after ${placed} placements and ${backs} backtracks. "Find all solutions" keeps searching past this one.` });
  player.load({ steps, code: CODE, vizTitle: 'Board and search tree', draw: draw(N, nodes, steps) });
}

function draw(N, nodes, steps) {
  const v = player.viz;
  v.innerHTML = `<div class="nq">
    <div class="board" style="--n:${N}"></div>
    <div class="tree-box"><div class="legend">
      <span><i style="background:var(--accent)"></i>current path</span>
      <span><i style="background:var(--muted)"></i>dead end</span></div>
      <div class="scroll"><svg class="nq-tree" role="img" aria-label="Search tree"></svg></div></div></div>`;
  const board = v.querySelector('.board');
  const sq = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) =>
    board.appendChild(Object.assign(document.createElement('div'), { className: 'sq' }))));

  // Search tree: one node per placement, children ordered by column.
  const DX = 26, DY = 40, R = 10, PAD = 14, NS = 'http://www.w3.org/2000/svg';
  let slot = 0;
  (function place(d, depth) {
    d.kids.forEach(k => place(k, depth + 1));
    d.x = d.kids.length ? (d.kids[0].x + d.kids.at(-1).x) / 2 : PAD + R + DX * slot++;
    d.y = PAD + R + depth * DY;
  })(nodes[0], 0);
  const svg = v.querySelector('svg'), wrap = v.querySelector('.tree-box .scroll');
  const w = Math.max(...nodes.map(d => d.x)) + R + PAD, h = PAD * 2 + R * 2 + N * DY;
  Object.entries({ width: w, height: h, viewBox: `0 0 ${w} ${h}` }).forEach(([k, val]) => svg.setAttribute(k, val));
  const el = (tag, attrs, parent = svg) => {
    const e = parent.appendChild(document.createElementNS(NS, tag));
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  for (const d of nodes) if (d.parent) d.edge = el('line', { class: 'edge', x1: d.parent.x, y1: d.parent.y, x2: d.x, y2: d.y });
  for (const d of nodes) {
    d.g = el('g', { class: 'node' });
    el('circle', { cx: d.x, cy: d.y, r: d.parent ? R : R + 2 }, d.g);
    el('text', { x: d.x, y: d.y }, d.g).textContent = d.parent ? d.col + 1 : '∅';
    el('title', {}, d.g).textContent = d.parent ? `Row ${d.row + 1}, column ${d.col + 1}` : 'Empty board';
  }

  return k => {
    const s = steps[k], onPath = new Set(s.path), seen = new Set([nodes[0]]), dead = new Set();
    for (const t of steps.slice(0, k + 1)) {
      if (t.line === 4) seen.add(t.node);
      if (t.line === 6) dead.add(t.node);
    }
    sq.forEach((row, r) => row.forEach((cell, c) => {
      const queen = s.q[r] === c, hit = !queen && s.q.some((qc, qr) => qr === r || qc === c || Math.abs(qc - c) === Math.abs(qr - r));
      cell.className = 'sq' + ((r + c) % 2 ? ' dark' : '') + (hit ? ' hit' : '') +
        (queen ? ' queen' : '') + (s.cur?.[0] === r && s.cur[1] === c ? ' new' : '') +
        (s.removed?.[0] === r && s.removed[1] === c ? ' removed' : '') + (s.dead === r ? ' dead' : '') + (s.solved ? ' solved' : '');
      cell.textContent = queen || (s.removed?.[0] === r && s.removed[1] === c) ? '♛' : '';
    }));
    for (const d of nodes) {
      d.g.classList.toggle('shown', seen.has(d));
      d.g.classList.toggle('active', onPath.has(d));
      d.g.classList.toggle('pruned', dead.has(d));
      d.g.classList.toggle('stuck', s.dead !== undefined && d === s.path.at(-1));
      d.edge?.classList.toggle('shown', seen.has(d));
      d.edge?.classList.toggle('on', onPath.has(d));
    }
    const cur = s.path.at(-1);
    wrap.scrollLeft = cur.x - wrap.clientWidth / 2;
  };
}

// Every solution, drawn as mini boards below the player.
$('all').onclick = () => {
  const N = +$('n').value, sols = [], q = [];
  (function solve(r) {
    if (r === N) return sols.push(q.slice());
    for (let c = 0; c < N; c++) if (!attackers(q, r, c).length) { q.push(c); solve(r + 1); q.pop(); }
  })(0);
  $('gallery')?.remove();
  const g = document.querySelector('main').appendChild(Object.assign(document.createElement('section'), { id: 'gallery', className: 'panel gallery' }));
  g.innerHTML = `<h2>All ${sols.length} solutions for N = ${N}</h2><div class="minis"></div>`;
  g.querySelector('.minis').innerHTML = sols.map((s, i) => `<div class="mini" style="--n:${N}" title="Solution ${i + 1}: columns ${s.map(c => c + 1).join(' ')}">${
    s.map((c, r) => `<i style="grid-area:${r + 1}/${c + 1}"></i>`).join('')}</div>`).join('');
  g.scrollIntoView({ behavior: 'smooth' });
};

$('n').onchange = load;
load();
