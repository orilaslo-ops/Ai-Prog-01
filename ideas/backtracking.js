// Backtracking: depth-first maze escape that backs up from every dead end.
const player = Player.mount({
  title: 'Backtracking: <span>escape the maze</span>',
  problem: `Backtracking is a way to search through choices: make a choice, keep going, and if you get stuck, undo the
    most recent choice and try another. Here the choices are which way to walk at each square of a maze. The search
    goes as deep as it can, and at every dead end it backs up to the last square that still has an untried direction.
    The same idea solves Sudoku, crosswords and the <a href="../algorithms/nqueens.html">N-Queens</a> puzzle.`,
  inputs: `
    <label>Size <select id="size"></select></label>
    <button id="new">New maze</button>
    <small class="hint-inline">Click any square to add or remove a wall.</small>`,
});

const $ = id => document.getElementById(id);
[9, 11, 15, 21].forEach(s => $('size').add(new Option(`${s} × ${s}`, s, s === 11, s === 11)));
const DIRS = [['Right', 0, 1], ['Down', 1, 0], ['Left', 0, -1], ['Up', -1, 0]];
const CODE = [
  'solve(square):',
  '  if square is the exit: return true',
  '  mark square visited',
  '  for dir in [right, down, left, up]:',
  '    next = square + dir',
  '    if next is open and not visited:',
  '      if solve(next): return true',
  '  return false     # dead end: back up',
];
let S, grid; // grid[r][c] === true means wall

// Random maze: carve passages with a randomized depth-first walk over the odd squares.
function generate() {
  S = +$('size').value;
  grid = Array.from({ length: S }, () => Array(S).fill(true));
  const stack = [[1, 1]];
  grid[1][1] = false;
  while (stack.length) {
    const [r, c] = stack.at(-1);
    const opts = DIRS.map(([, dr, dc]) => [r + 2 * dr, c + 2 * dc, r + dr, c + dc])
      .filter(([nr, nc]) => nr > 0 && nc > 0 && nr < S - 1 && nc < S - 1 && grid[nr][nc]);
    if (!opts.length) { stack.pop(); continue; }
    const [nr, nc, wr, wc] = opts[Math.floor(Math.random() * opts.length)];
    grid[wr][wc] = grid[nr][nc] = false;
    stack.push([nr, nc]);
  }
  load();
}

function load() {
  const goal = [S - 2, S - 2], key = (r, c) => r * S + c, at = ([r, c]) => `(${r}, ${c})`;
  const path = [[1, 1]], visited = new Set([key(1, 1)]), dead = new Set(), steps = [];
  let moves = 0, backs = 0;
  const options = [...DIRS.map(d => d[0]), 'Back up'];
  const push = s => steps.push({ path: path.map(p => key(...p)), dead: [...dead],
    state: { position: at(path.at(-1) || [1, 1]), 'path length': path.length, moves, backtracks: backs }, ...s });

  push({ line: 0, why: `Start in the top-left corner and look for the exit in the bottom-right. At every square, try the directions in a fixed order: right, down, left, up.` });
  while (path.length) {
    const [r, c] = path.at(-1);
    if (r === goal[0] && c === goal[1]) break;
    const reasons = [];
    let next = null;
    for (const [name, dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (grid[nr]?.[nc] !== false) reasons.push(`${name} is a wall`);
      else if (dead.has(key(nr, nc))) reasons.push(`${name} was already explored (dead end)`);
      else if (visited.has(key(nr, nc))) reasons.push(`${name} is where we came from`);
      else { next = [nr, nc, name]; break; }
    }
    const predict = { question: `At ${at([r, c])}: which way does the search go next?`, options, answer: next ? next[2] : 'Back up' };
    if (next) {
      path.push([next[0], next[1]]); visited.add(key(next[0], next[1])); moves++;
      push({ line: 6, predict, why: (reasons.length ? reasons.join(', ') + ', so ' : '') + `${next[2].toLowerCase()} is the first open, unvisited direction. Go ${next[2].toLowerCase()}.` });
    } else {
      path.pop(); dead.add(key(r, c)); backs++;
      push({ line: 7, predict, why: `Dead end at ${at([r, c])}: ${reasons.join(', ').replace(/, ([^,]*)$/, ' and $1')}. Nothing is left to try here, so undo the last move` +
        (path.length ? ` and back up to ${at(path.at(-1))}, which may still have untried directions.` : '.') });
    }
  }
  push(path.length
    ? { line: 1, won: true, why: `Found the exit! The path is ${path.length} squares long, found with ${moves} moves and ${backs} backtracks. Grey squares are dead ends the search tried and undid.` }
    : { line: 7, why: `No way out: every route ended in a dead end. By backing up all the way to the start, the search proved there is no path.` });
  player.load({ steps, code: CODE, vizTitle: 'Maze', draw: draw(steps, goal, key) });
}

function draw(steps, goal, key) {
  player.viz.innerHTML = `<div class="legend">
      <span><i style="background:var(--accent)"></i>current square</span>
      <span><i style="background:var(--wait)"></i>current path</span>
      <span><i style="background:var(--border)"></i>dead end (undone)</span>
      <span><i style="background:var(--done)"></i>exit path</span></div>
    <div class="maze" style="--s:${S}"></div>`;
  const box = player.viz.querySelector('.maze');
  const cells = grid.flatMap((row, r) => row.map((wall, c) => {
    const d = box.appendChild(document.createElement('div'));
    d.dataset.r = r; d.dataset.c = c;
    if (r === 1 && c === 1) d.textContent = 'S';
    if (r === goal[0] && c === goal[1]) d.textContent = 'E';
    return d;
  }));
  box.onclick = e => {
    const r = +e.target.dataset.r, c = +e.target.dataset.c;
    if (!e.target.dataset.r || r === 0 || c === 0 || r === S - 1 || c === S - 1 || (r === 1 && c === 1) || (r === goal[0] && c === goal[1])) return;
    grid[r][c] = !grid[r][c];
    load();
  };
  return k => {
    const s = steps[k], onPath = new Set(s.path), dead = new Set(s.dead), cur = s.path.at(-1);
    cells.forEach((d, i) => {
      const r = Math.floor(i / S), c = i % S;
      d.className = 'm' + (grid[r][c] ? ' wall' : '') + (onPath.has(i) ? (s.won ? ' win' : ' path') : '') +
        (dead.has(i) ? ' dead' : '') + (i === cur && !s.won ? ' cur' : '');
    });
  };
}

$('new').onclick = $('size').onchange = generate;
generate();
