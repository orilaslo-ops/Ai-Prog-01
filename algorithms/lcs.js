// Longest Common Subsequence: DP table fill + backtrace, or plain recursion for comparison.
const MAX_LEN = 8, MAX_TREE = 400;

const player = Player.mount({
  title: 'Longest Common <span>Subsequence</span>',
  problem: `Given two strings, find the longest sequence of letters that appears in both, in the same order but not
    necessarily side by side. "ABCBDA" and "BDCABA" share "BCBA". Diff tools use this to compare files and biologists
    use it to line up DNA. Checking every possible subsequence takes exponential time; dynamic programming instead
    fills a table of small answers, where each cell is built from cells already solved.`,
  inputs: `
    <label>A <input id="a" class="text" maxlength="${MAX_LEN}" value="ABCBDA" spellcheck="false" autocomplete="off"></label>
    <label>B <input id="b" class="text" maxlength="${MAX_LEN}" value="BDCABA" spellcheck="false" autocomplete="off"></label>
    <button id="rand">Randomize</button>
    <label class="toggle"><input type="checkbox" id="rec"> Compare with plain recursion</label>`,
});

const $ = id => document.getElementById(id);
const clean = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, MAX_LEN);

function load() {
  const A = clean($('a').value), B = clean($('b').value);
  player.load($('rec').checked ? recursion(A, B) : dp(A, B));
}

$('a').oninput = $('b').oninput = load;
$('rec').onchange = load;
$('rand').onclick = () => {
  const word = () => Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => 'ABCD'[Math.floor(Math.random() * 4)]).join('');
  $('a').value = word(); $('b').value = word();
  load();
};

// ---------- Dynamic programming ----------

const DP_CODE = [
  'T[0][*] = T[*][0] = 0',
  'for i in 1..m, j in 1..n:',
  '  if A[i] == B[j]:',
  '    T[i][j] = T[i-1][j-1] + 1',
  '  else:',
  '    T[i][j] = max(T[i-1][j], T[i][j-1])',
  'i, j = m, n',
  'while i > 0 and j > 0:',
  '  if A[i] == B[j]: take A[i]; i--; j--',
  '  elif T[i-1][j] >= T[i][j-1]: i--',
  '  else: j--',
];

function dp(A, B) {
  const m = A.length, n = B.length;
  const T = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const steps = [], path = [], taken = [];
  let filled = 0;
  const push = s => steps.push({ T: T.map(r => r.slice()), path: path.slice(), taken: taken.slice(), ...s });
  const lcsSoFar = () => taken.map(([i]) => A[i - 1]).reverse().join('') || '—';

  push({ line: -1, why: `Cell (i, j) of the table will hold the LCS length of A's first i letters and B's first j letters. The bottom-right cell is the answer for the full strings.`,
    state: { 'A length (m)': m, 'B length (n)': n } });

  for (let i = 0; i <= m; i++) T[i][0] = 0;
  for (let j = 0; j <= n; j++) T[0][j] = 0;
  filled = m + n + 1;
  push({ line: 0, why: `Row 0 and column 0 compare against an empty string. Nothing is shared with an empty string, so they are all 0.`,
    state: { 'cells filled': filled } });

  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const a = A[i - 1], b = B[j - 1], d = T[i - 1][j - 1], top = T[i - 1][j], left = T[i][j - 1];
    const match = a === b, v = match ? d + 1 : Math.max(top, left);
    const options = [...new Set([v, d + 1, top, left, v + 1])].sort((x, y) => x - y).map(String);
    const predict = { question: `What value goes in T[${i}][${j}]? A[${i}] = '${a}', B[${j}] = '${b}'.`, options, answer: String(v) };
    T[i][j] = v; filled++;
    const why = match
      ? `'${a}' = '${b}': the letters match. Any common subsequence of the shorter prefixes can be extended by this shared letter, so take the diagonal (${d}) + 1 = ${v}.`
      : `'${a}' ≠ '${b}': they can't both end the subsequence, so drop one. Dropping A's letter gives ${top} (above), dropping B's gives ${left} (left). Keep the larger: ${v}.`;
    const used = match ? [[i - 1, j - 1]] : top >= left ? [[i - 1, j]] : [[i, j - 1]];
    push({ line: match ? 3 : 5, cur: [i, j], deps: [[i - 1, j - 1], [i - 1, j], [i, j - 1]], used, why, predict,
      state: { i, j, 'A[i]': a, 'B[j]': b, 'diagonal': d, 'above': top, 'left': left, 'T[i][j]': v, 'cells filled': filled } });
  }

  let i = m, j = n;
  push({ line: 6, cur: [i, j], why: `Table full: the LCS is ${T[m][n]} letters long. To recover the letters, walk back from the bottom-right corner, retracing the choice each cell made.`,
    state: { i, j, 'LCS length': T[m][n], 'LCS so far': '—' } });

  while (i > 0 && j > 0) {
    const a = A[i - 1], b = B[j - 1], top = T[i - 1][j], left = T[i][j - 1];
    const move = a === b ? 'diag' : top >= left ? 'up' : 'left';
    const labels = { diag: '↖ diagonal (take the letter)', up: '↑ up', left: '← left' };
    const predict = { question: `From T[${i}][${j}] ('${a}' vs '${b}'), where does the backtrace go?`, options: Object.values(labels), answer: labels[move] };
    path.push([i, j]);
    if (move === 'diag') taken.push([i, j]);
    const why = {
      diag: `'${a}' = '${b}': this cell came from the diagonal, so '${a}' is part of the LCS. Take it and move ↖.`,
      up: `'${a}' ≠ '${b}' and above (${top}) ≥ left (${left}), so this value came from skipping A's '${a}'. Move ↑.`,
      left: `'${a}' ≠ '${b}' and left (${left}) > above (${top}), so this value came from skipping B's '${b}'. Move ←.`,
    }[move];
    push({ line: { diag: 8, up: 9, left: 10 }[move], cur: [i, j], why, predict,
      state: { i, j, 'A[i]': a, 'B[j]': b, 'above': top, 'left': left, 'move': labels[move], 'LCS so far': lcsSoFar() } });
    if (move !== 'up') j--;
    if (move !== 'left') i--;
  }

  const lcs = lcsSoFar();
  push({ line: -1, why: T[m][n]
      ? `Reached the edge of the table. The taken letters, read in order, give "${lcs}" (length ${T[m][n]}), highlighted in both strings.`
      : `No letters in common, so the LCS is empty.`,
    state: { LCS: lcs, length: T[m][n], 'cells filled': filled } });

  return { steps, code: DP_CODE, vizTitle: 'DP table', draw: drawDP(A, B, steps) };
}

function drawDP(A, B, steps) {
  const v = player.viz;
  v.innerHTML = `<div class="strings">${stringRow('A', A)}${stringRow('B', B)}</div><div class="scroll"><table class="dp"></table></div>`;
  const table = v.querySelector('table');
  const head = table.insertRow();
  ['', '∅', ...B].forEach(c => head.append(Object.assign(document.createElement('th'), { textContent: c })));
  const cells = [], rowHeads = [];
  for (let i = 0; i <= A.length; i++) {
    const r = table.insertRow();
    rowHeads.push(r.appendChild(Object.assign(document.createElement('th'), { textContent: i ? A[i - 1] : '∅' })));
    cells.push(Array.from({ length: B.length + 1 }, () => r.insertCell()));
  }
  const colHeads = [...head.children].slice(1);
  const chars = [...v.querySelectorAll('.strings .row')].map(r => [...r.querySelectorAll('.ch')]);

  return k => {
    const s = steps[k], has = (list, i, j) => list?.some(([x, y]) => x === i && y === j);
    const [ci, cj] = s.cur || [-1, -1];
    cells.forEach((row, i) => row.forEach((td, j) => {
      td.textContent = s.T[i][j] ?? '';
      td.className = [
        i === ci && j === cj && 'cur',
        has(s.deps, i, j) && 'dep',
        has(s.used, i, j) && 'used',
        has(s.path, i, j) && 'path',
        has(s.taken, i, j) && 'take',
      ].filter(Boolean).join(' ');
    }));
    const match = ci > 0 && cj > 0 && A[ci - 1] === B[cj - 1];
    rowHeads.forEach((th, i) => th.className = i === ci && i > 0 ? (match ? 'match' : 'miss') : '');
    colHeads.forEach((th, j) => th.className = j === cj && j > 0 ? (match ? 'match' : 'miss') : '');
    chars[0].forEach((c, i) => c.className = 'ch' + (s.taken.some(([x]) => x === i + 1) ? ' take' : '') + (i + 1 === ci ? ' cur' : ''));
    chars[1].forEach((c, j) => c.className = 'ch' + (s.taken.some(([, y]) => y === j + 1) ? ' take' : '') + (j + 1 === cj ? ' cur' : ''));
  };
}

const stringRow = (name, s) => `<div class="row"><b>${name}</b>${[...s].map(c => `<span class="ch">${c}</span>`).join('') || '<i>(empty)</i>'}</div>`;

// ---------- Plain recursion ----------

const REC_CODE = [
  'lcs(i, j):',
  '  if i == 0 or j == 0: return 0',
  '  if A[i] == B[j]: return 1 + lcs(i-1, j-1)',
  '  return max(lcs(i-1, j), lcs(i, j-1))',
];

function recursion(A, B) {
  const nodes = [], events = [], seen = new Set();
  (function lcs(i, j, parent, depth) {
    const key = i + ',' + j;
    const me = { i, j, parent, depth, kids: [], repeat: seen.has(key) };
    seen.add(key);
    nodes.push(me);
    if (parent) parent.kids.push(me);
    events.push({ t: 'call', node: me });
    me.value = !i || !j ? 0 : A[i - 1] === B[j - 1] ? 1 + lcs(i - 1, j - 1, me, depth + 1)
      : Math.max(lcs(i - 1, j, me, depth + 1), lcs(i, j - 1, me, depth + 1));
    events.push({ t: 'ret', node: me });
    return me.value;
  })(A.length, B.length, null, 0);

  const cells = (A.length + 1) * (B.length + 1), repeats = nodes.filter(d => d.repeat).length;
  const lineOf = d => !d.i || !d.j ? 1 : A[d.i - 1] === B[d.j - 1] ? 2 : 3;
  const vizTitle = `Recursion tree: ${nodes.length} calls vs ${cells} DP table cells`;

  if (nodes.length > MAX_TREE) {
    player.viz.innerHTML = `<div class="versus"><div><b>${nodes.length}</b>recursive calls<small>${repeats} of them repeats</small></div><div><b>${cells}</b>DP table cells</div></div>`;
    return { code: REC_CODE, vizTitle, draw: () => {}, steps: [{ line: 0, state: { calls: nodes.length, repeats, 'DP cells': cells },
      why: `Plain recursion needs ${nodes.length} calls here, too many to draw. ${repeats} of them re-solve a subproblem already solved, while DP fills each of the ${cells} cells exactly once. Shorten the strings to watch the tree.` }] };
  }

  const steps = [{ line: -1, why: `Plain recursion solves lcs(${A.length}, ${B.length}) by calling itself on shorter prefixes, without remembering any answers. Watch for red calls: subproblems it has already solved once.`,
    state: { calls: 0, repeats: 0, 'DP cells': cells } }];
  let calls = 0, reps = 0, depth = 0;
  for (const e of events) {
    const d = e.node, key = `lcs(${d.i},${d.j})`;
    let why;
    if (e.t === 'call') {
      calls++; reps += d.repeat; depth++;
      why = `${key}: LCS of "${A.slice(0, d.i)}" and "${B.slice(0, d.j)}". ` + (
        !d.i || !d.j ? 'One side is empty, so the answer is 0.'
        : A[d.i - 1] === B[d.j - 1] ? `Last letters match ('${A[d.i - 1]}'), so it only needs lcs(${d.i - 1},${d.j - 1}).`
        : `Last letters differ ('${A[d.i - 1]}' vs '${B[d.j - 1]}'), so it must try both: skip A's letter, then skip B's.`)
        + (d.repeat ? ` Already solved this exact subproblem before! Without a table, the work is done again.` : '');
    } else {
      depth--;
      why = `${key} returns ${d.value}` + (d.parent ? ` to lcs(${d.parent.i},${d.parent.j}).` : `. Done: ${calls} calls, ${reps} of them repeats, versus ${cells} cells for the DP table.`);
    }
    steps.push({ line: lineOf(d), why, ev: e, state: { call: key, depth, calls, repeats: reps, 'DP cells': cells } });
  }
  return { steps, code: REC_CODE, vizTitle, draw: drawTree(nodes, steps) };
}

function drawTree(nodes, steps) {
  const DX = 40, DY = 58, R = 16, PAD = 20, NS = 'http://www.w3.org/2000/svg';
  let slot = 0;
  (function place(d) {
    d.kids.forEach(place);
    d.x = d.kids.length ? (d.kids[0].x + d.kids.at(-1).x) / 2 : PAD + R + DX * slot++;
    d.y = PAD + R + d.depth * DY;
  })(nodes[0]);
  const w = Math.max(...nodes.map(d => d.x)) + R + PAD, h = Math.max(...nodes.map(d => d.y)) + R + PAD;
  player.viz.innerHTML = `<div class="legend">
      <span><i style="background:var(--accent)"></i>running now</span>
      <span><i style="background:var(--wait)"></i>waiting</span>
      <span><i style="background:var(--done)"></i>returned</span>
      <span><i style="background:var(--bad)"></i>repeated subproblem</span></div>
    <div class="scroll"><svg class="rec-tree" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Recursion tree"></svg></div>`;
  const svg = player.viz.querySelector('svg'), wrap = player.viz.querySelector('.scroll');
  const el = (tag, attrs, parent = svg) => {
    const e = parent.appendChild(document.createElementNS(NS, tag));
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  for (const d of nodes) if (d.parent) d.edge = el('line', { class: 'edge', x1: d.parent.x, y1: d.parent.y, x2: d.x, y2: d.y });
  for (const d of nodes) {
    d.g = el('g', { class: 'node' + (d.repeat ? ' repeat' : '') });
    el('circle', { cx: d.x, cy: d.y, r: R }, d.g);
    el('text', { x: d.x, y: d.y }, d.g).textContent = `${d.i},${d.j}`;
    el('title', {}, d.g).textContent = `lcs(${d.i},${d.j}) = ${d.value}`;
  }

  return k => {
    const called = new Set(), returned = new Set(), stack = [];
    for (const s of steps.slice(1, k + 1)) {
      if (s.ev.t === 'call') { called.add(s.ev.node); stack.push(s.ev.node); }
      else { returned.add(s.ev.node); stack.pop(); }
    }
    const top = stack.at(-1);
    for (const d of nodes) {
      d.g.classList.toggle('shown', called.has(d));
      d.g.classList.toggle('active', d === top);
      d.g.classList.toggle('done', returned.has(d));
      d.edge?.classList.toggle('shown', called.has(d));
    }
    const cur = steps[k].ev?.node;
    if (cur) { wrap.scrollLeft = cur.x - wrap.clientWidth / 2; wrap.scrollTop = cur.y - wrap.clientHeight / 2; }
  };
}

load();
