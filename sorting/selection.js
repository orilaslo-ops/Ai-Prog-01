SORTS.push({
  id: 'selection', name: 'Selection sort',
  problem: `Put a list of numbers in increasing order. Selection sort scans the unsorted part for its smallest value and
    swaps it into the next position, growing a sorted part from the left. It always makes about n²/2 comparisons but
    at most n swaps, which matters when moving data is expensive.`,
  code: [
    'for i in 0..n-2:',
    '  min = i',
    '  for j in i+1..n-1:',
    '    if a[j] < a[min]: min = j',
    '  swap(a[i], a[min])',
  ],
  run(a, step) {
    const n = a.length, done = [];
    let cmp = 0, swaps = 0;
    const st = extra => ({ comparisons: cmp, swaps, ...extra });
    step({ line: -1, why: `Each round finds the smallest value left and moves it to the front of the unsorted part.`, state: st() });
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      step({ line: 1, hi: { [i]: 'pivot' }, done: [...done], state: st({ i, min: a[i].v }),
        why: `Round ${i + 1}: find the smallest value in positions ${i + 1}–${n}. Start by assuming it is ${a[i].v}.` });
      for (let j = i + 1; j < n; j++) {
        const smaller = a[j].v < a[min].v, old = a[min].v;
        cmp++;
        if (smaller) min = j;
        step({ line: 3, hi: { [min]: 'pivot', [j]: 'cmp' }, done: [...done], state: st({ i, j, 'a[j]': a[j].v, min: a[min].v }),
          why: smaller ? `${a[j].v} < ${old}: a new smallest value so far.` : `${a[j].v} ≥ ${old}: not smaller, so ${old} is still the minimum.`,
          predict: { question: `Is ${a[j].v} smaller than the current minimum ${old}?`, options: ['Yes: new minimum', 'No: keep the minimum'], answer: smaller ? 'Yes: new minimum' : 'No: keep the minimum' } });
      }
      const m = a[min].v, rest = [...new Set(a.slice(i).map(x => x.v))].sort((x, y) => x - y).map(String);
      if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; swaps++; }
      done.push(i);
      step({ line: 4, hi: min !== i ? { [i]: 'swap', [min]: 'swap' } : {}, done: [...done], state: st({ i }),
        why: min !== i ? `Scan finished: ${m} is the smallest of the unsorted part, so swap it into position ${i + 1}. It is now final.` : `Scan finished: ${m} was already the smallest and already in position ${i + 1}. No swap needed.`,
        predict: { question: `Scan finished. Which value goes into position ${i + 1}?`, options: rest, answer: String(m) } });
    }
    step({ line: -1, done: [...a.keys()], state: st(), why: `Sorted! ${cmp} comparisons and ${swaps} swaps.` });
  },
});
