// Shared step player for every algorithm page: builds the standard layout,
// then replays a list of precomputed steps. Each step is
// { why, line, state: {name: value}, predict?: {question, options, answer} }.
const Player = {
  mount({ title, problem, inputs, root }) {
    const main = root || document.querySelector('main');
    main.innerHTML = `
      ${title ? `<h1>${title}</h1>` : ''}
      <section class="problem"><h2>What problem does this solve?</h2><p>${problem}</p></section>
      <div class="controls">${inputs}</div>
      <div class="controls">
        <button class="back" aria-label="Step back">◀ Back</button>
        <button class="next" aria-label="Step forward">Step ▶</button>
        <button class="play primary">Play</button>
        <button class="reset">Reset</button>
        <label>Speed <input class="speed" type="range" min="1" max="20" value="6"></label>
        <label class="toggle"><input type="checkbox" class="predict-on"> 🎯 Predict the next step</label>
        <div class="stats"></div>
      </div>
      <div class="caption" aria-live="polite"></div>
      <div class="ask" hidden></div>
      <div class="grid">
        <section class="panel"><h2 class="viz-title"></h2><div class="viz"></div></section>
        <section class="panel">
          <h2>State</h2><dl class="state"></dl>
          <h2>Code</h2><pre class="code"></pre>
        </section>
      </div>`;
    const $ = s => main.querySelector(s);
    let steps = [], draw, i = 0, timer = null, score;

    function load(cfg) {
      stop();
      ({ steps, draw } = cfg);
      $('.viz-title').textContent = cfg.vizTitle;
      if (cfg.problem) $('.problem p').innerHTML = cfg.problem;
      $('.code').replaceChildren(...cfg.code.map(l => Object.assign(document.createElement('div'), { textContent: l || ' ' })));
      score = { right: 0, total: 0 };
      showScore();
      go(0);
    }

    function go(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      const s = steps[i];
      $('.ask').hidden = true;
      draw(i);
      $('.caption').textContent = s.why;
      $('.state').replaceChildren(...Object.entries(s.state || {}).flatMap(([k, v]) => [
        Object.assign(document.createElement('dt'), { textContent: k }),
        Object.assign(document.createElement('dd'), { textContent: v }),
      ]));
      [...$('.code').children].forEach((l, k) => l.classList.toggle('hl', k === s.line));
      $('.back').disabled = i === 0;
      $('.next').disabled = $('.play').disabled = i === steps.length - 1;
      if (i === steps.length - 1) stop();
    }

    function next() {
      const q = steps[i + 1]?.predict;
      if (q && $('.predict-on').checked) ask(q);
      else go(i + 1);
    }

    // Pause before the step, let the user guess, then reveal it.
    function ask(q) {
      stop();
      const box = $('.ask');
      box.innerHTML = `<b>Predict:</b> ${q.question}<div class="options"></div>`;
      for (const opt of q.options) {
        const b = Object.assign(document.createElement('button'), { textContent: opt });
        b.onclick = () => {
          const right = opt === q.answer;
          score.total++; score.right += right;
          showScore();
          go(i + 1);
          // Verdict goes in front of the step's explanation, so the student sees why.
          $('.caption').insertAdjacentHTML('afterbegin', right
            ? `<b class="verdict right">✓ Correct!</b> `
            : `<b class="verdict wrong">✗ Not quite: you picked "${opt}", the algorithm chose "${q.answer}".</b> `);
        };
        box.querySelector('.options').append(b);
      }
      box.hidden = false;
      box.querySelector('button').focus();
    }

    function showScore() { $('.stats').innerHTML = score.total ? `Predictions: <b>${score.right}/${score.total}</b>` : ''; }
    function stop() { clearInterval(timer); timer = null; $('.play').textContent = 'Play'; }
    function play() {
      if (timer) return stop();
      if (!$('.ask').hidden && $('.ask .options')) return; // waiting for an answer
      $('.play').textContent = 'Pause';
      timer = setInterval(next, 2400 / $('.speed').value);
      next();
    }

    $('.next').onclick = () => { stop(); next(); };
    $('.back').onclick = () => { stop(); go(i - 1); };
    $('.reset').onclick = () => { stop(); go(0); };
    $('.play').onclick = play;
    $('.speed').oninput = () => { if (timer) { stop(); play(); } };
    document.addEventListener('keydown', e => {
      if (e.target.closest('input, select, textarea') || (e.key === ' ' && e.target.closest('button'))) return;
      if (e.key === 'ArrowRight') { stop(); next(); }
      if (e.key === 'ArrowLeft') { stop(); go(i - 1); }
      if (e.key === ' ') { e.preventDefault(); play(); }
    });

    return { load, viz: $('.viz') };
  },
};
