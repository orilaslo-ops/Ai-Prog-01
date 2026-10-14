// Memoization: fib(n) with a memo table, compared against plain recursion.
const MAX_TREE = 300;
const player = Player.mount({
  title: 'Memoization: <span>remember answers</span>',
  problem: `Recursion often asks the same question many times: the plain fib(n) on the <a href="../index.html#recursion">Recursion</a>
    page works out fib(2) over and over. Memoization keeps a notebook, the memo. Before computing fib(k), check whether
    the answer is already written down. If it is, return it instantly; if not, compute it once and write it down. One
    dictionary turns exponential time into linear time.`,
  inputs: `
    <label>n <select id="n"></select></label>
    <label class="toggle"><input type="checkbox" id="memo" checked> Use memo</label>`,
});

const $ = id => document.getElementById(id);
for (let i = 1; i <= 15; i++) $('n').add(new Option(i, i, i === 6, i === 6));
const MEMO_CODE = [
  'fib(n):',
  '  if n in memo: return memo[n]     # cache hit',
  '  if n < 2: return n',
  '  memo[n] = fib(n-1) + fib(n-2)',
  '  return memo[n]',
];
const PLAIN_CODE = [
  'fib(n):',
  '  if n < 2: return n',
  '  return fib(n-1) + fib(n-2)',
];

function load() {
  const n = +$('n').value, useMemo = $('memo').checked;
  const nodes = [], events = [], memo = new Map(), computed = new Set();
  (function fib(k, parent, depth) {
    const me = { k, parent, depth, kids: [], hit: useMemo && memo.has(k), repeat: !useMemo && computed.has(k) };
    nodes.push(me);
    if (parent) parent.kids.push(me);
    events.push({ t: 'call', node: me });
    me.value = me.hit ? memo.get(k) : k < 2 ? k : fib(k - 1, me, depth + 1) + fib(k - 2, me, depth + 1);
    const stored = useMemo && !me.hit && k >= 2;
    if (stored) memo.set(k, me.value);
    computed.add(k);
    events.push({ t: 'ret', node: me, stored });
    return me.value;
  })(n, null, 0);

  // Call counts for both versions: plain makes 2·fib(n+1) − 1 calls, memo makes 2n − 1.
  let a = 0, b = 1;
  for (let i = 0; i < n + 1; i++) [a, b] = [b, a + b];
  const plainCalls = 2 * a - 1, memoCalls = Math.max(1, 2 * n - 1);
  const other = useMemo ? `${plainCalls} without memo` : `${memoCalls} with memo`;
  const vizTitle = `Call tree: ${nodes.length} calls (vs ${other})`;
  const code = useMemo ? MEMO_CODE : PLAIN_CODE;

  if (nodes.length > MAX_TREE) {
    player.viz.innerHTML = `<div class="versus"><div><b>${plainCalls}</b>calls without memo<small>${plainCalls - memoCalls} wasted on repeats</small></div><div><b>${memoCalls}</b>calls with memo</div></div>`;
    return player.load({ code, vizTitle, draw: () => {}, steps: [{ line: 0, state: { 'calls without memo': plainCalls, 'calls with memo': memoCalls },
      why: `Plain recursion needs ${plainCalls} calls for fib(${n}), too many to draw. With a memo it needs only ${memoCalls}. Turn the memo on or pick a smaller n to watch the tree.` }] });
  }

  const steps = [{ line: -1, state: { calls: 0 }, why: useMemo
    ? `Compute fib(${n}) with an empty memo. Watch the memo fill from small n upward, and the green dashed calls that return straight from it.`
    : `Compute fib(${n}) with no memory of past answers. Red calls are ones that were already computed before and get recomputed from scratch.` }];
  let calls = 0, hits = 0, repeats = 0, depth = 0;
  for (const e of events) {
    const d = e.node, k = d.k;
    let why, line, predict;
    if (e.t === 'call') {
      calls++; depth++; hits += d.hit; repeats += d.repeat;
      line = useMemo ? (d.hit ? 1 : k < 2 ? 2 : 3) : (k < 2 ? 1 : 2);
      why = `fib(${k}) is called. ` + (d.hit ? `It's already in the memo (${d.value}), so return it at once, with no further calls.`
        : k < 2 ? `Base case: fib(${k}) = ${k}.`
        : useMemo ? `Not in the memo yet, so compute it from fib(${k - 1}) and fib(${k - 2}).`
        : `Compute fib(${k - 1}) + fib(${k - 2}).` + (d.repeat ? ` fib(${k}) was already computed earlier, but plain recursion forgot it, so the whole subtree is done again.` : ''));
      predict = useMemo
        ? { question: `fib(${k}) is being called. Is it a cache hit (already in the memo)?`, options: ['Yes: cache hit', 'No: compute it'], answer: d.hit ? 'Yes: cache hit' : 'No: compute it' }
        : { question: `fib(${k}) is being called. Has fib(${k}) been computed before?`, options: ['Yes: a repeat', 'No: first time'], answer: d.repeat ? 'Yes: a repeat' : 'No: first time' };
    } else {
      depth--;
      line = useMemo ? (d.hit ? 1 : k < 2 ? 2 : 4) : (k < 2 ? 1 : 2);
      why = `fib(${k}) = ${d.value}` + (e.stored ? `, written into memo[${k}] so it never has to be computed again` : '') +
        (d.parent ? `. Return it to fib(${d.parent.k}).` : `. Done with ${calls} calls; without memo it takes ${plainCalls}, with memo ${memoCalls}.`);
    }
    steps.push({ line, why, predict, ev: e, state: { call: `fib(${k})`, depth, calls, [useMemo ? 'cache hits' : 'repeats']: useMemo ? hits : repeats } });
  }
  player.load({ steps, code, vizTitle, draw: draw(nodes, steps, n, useMemo) });
}

function draw(nodes, steps, n, useMemo) {
  const DX = 40, DY = 56, R = 16, PAD = 20, NS = 'http://www.w3.org/2000/svg';
  let slot = 0;
  (function place(d) {
    d.kids.forEach(place);
    d.x = d.kids.length ? (d.kids[0].x + d.kids.at(-1).x) / 2 : PAD + R + DX * slot++;
    d.y = PAD + R + d.depth * DY;
  })(nodes[0]);
  const w = Math.max(...nodes.map(d => d.x)) + R + PAD, h = Math.max(...nodes.map(d => d.y)) + R + PAD;
  player.viz.innerHTML = (useMemo ? `<div class="memo-row">${Array.from({ length: n + 1 }, (_, k) =>
      `<div class="memo-cell"><small>memo[${k}]</small><b></b></div>`).join('')}</div>` : '') +
    `<div class="legend">
      <span><i style="background:var(--accent)"></i>running now</span>
      <span><i style="background:var(--wait)"></i>waiting</span>
      <span><i style="background:var(--done)"></i>returned</span>
      ${useMemo ? '<span><i class="sw-hit"></i>cache hit</span>' : '<span><i style="background:var(--bad)"></i>repeated work</span>'}</div>
    <div class="scroll"><svg class="rec-tree" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Call tree"></svg></div>`;
  const svg = player.viz.querySelector('svg'), wrap = player.viz.querySelector('.scroll');
  const memoCells = [...player.viz.querySelectorAll('.memo-cell')];
  const el = (tag, attrs, parent = svg) => {
    const e = parent.appendChild(document.createElementNS(NS, tag));
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  for (const d of nodes) if (d.parent) d.edge = el('line', { class: 'edge', x1: d.parent.x, y1: d.parent.y, x2: d.x, y2: d.y });
  for (const d of nodes) {
    d.g = el('g', { class: 'node' + (d.repeat ? ' repeat' : '') + (d.hit ? ' hit' : '') });
    el('circle', { cx: d.x, cy: d.y, r: R }, d.g);
    el('text', { x: d.x, y: d.y }, d.g).textContent = d.k;
    el('title', {}, d.g).textContent = `fib(${d.k}) = ${d.value}` + (d.hit ? ' (from memo)' : '');
  }

  return k => {
    const called = new Set(), returned = new Set(), stack = [], stored = new Map();
    for (const s of steps.slice(1, k + 1)) {
      const d = s.ev.node;
      if (s.ev.t === 'call') { called.add(d); stack.push(d); }
      else { returned.add(d); stack.pop(); if (s.ev.stored) stored.set(d.k, d.value); }
    }
    const top = stack.at(-1), cur = steps[k].ev;
    for (const d of nodes) {
      d.g.classList.toggle('shown', called.has(d));
      d.g.classList.toggle('active', d === top);
      d.g.classList.toggle('done', returned.has(d));
      d.edge?.classList.toggle('shown', called.has(d));
    }
    memoCells.forEach((c, i) => {
      c.querySelector('b').textContent = stored.has(i) ? stored.get(i) : '';
      c.className = 'memo-cell' + (stored.has(i) ? ' full' : '') +
        (cur && cur.node.k === i && (cur.node.hit || cur.stored) ? ' flash' : '');
    });
    if (cur) { wrap.scrollLeft = cur.node.x - wrap.clientWidth / 2; wrap.scrollTop = cur.node.y - wrap.clientHeight / 2; }
  };
}

$('n').onchange = $('memo').onchange = load;
load();
