SORTS.push({
  id: 'insertion', name: 'Insertion sort',
  problem: `Put a list of numbers in increasing order. Insertion sort works like sorting a hand of cards: take the next
    card and slide it left past every bigger card until it fits. On a list that is already nearly sorted it barely
    has to move anything, which is why real libraries use it for small or almost-sorted inputs.`,
  code: [
    'for i in 1..n-1:',
    '  key = a[i]',
    '  j = i - 1',
    '  while j >= 0 and a[j] > key:',
    '    a[j+1] = a[j]; j--      # shift right',
    '  a[j+1] = key',
  ],
  run(a, step) {
    const n = a.length;
    let cmp = 0, shifts = 0;
    const st = extra => ({ comparisons: cmp, shifts, ...extra });
    step({ line: -1, why: `The left part is always sorted. Each round takes the next value and inserts it into that sorted part.`, state: st() });
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let p = i;
      while (p > 0 && a[p - 1].v > key.v) p--;
      step({ line: 1, hi: { [i]: 'pivot' }, range: [0, i + 1], state: st({ i, key: key.v }),
        why: `Take ${key.v}. Positions 1–${i} are sorted; find where ${key.v} belongs among them.`,
        predict: { question: `The next key is ${key.v}. At which position will it end up?`, options: [...Array(i + 1).keys()].map(k => `Position ${k + 1}`), answer: `Position ${p + 1}` } });
      let j = i;
      while (j > 0 && a[j - 1].v > key.v) {
        cmp++; shifts++;
        const big = a[j - 1].v;
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        j--;
        step({ line: 4, hi: { [j]: 'pivot', [j + 1]: 'swap' }, range: [0, i + 1], state: st({ i, j, key: key.v }),
          why: `${big} > ${key.v}, so ${big} shifts one place right to make room.` });
      }
      if (j > 0) cmp++;
      step({ line: 5, hi: { [j]: 'swap' }, range: [0, i + 1], state: st({ i, key: key.v }),
        why: (j > 0 ? `${a[j - 1].v} ≤ ${key.v}, so stop: ` : `Nothing left to compare, so `) + `${key.v} goes in position ${j + 1}. The first ${i + 1} values are now sorted.` });
    }
    step({ line: -1, done: [...a.keys()], state: st(), why: `Sorted! ${cmp} comparisons and ${shifts} shifts.` });
  },
});
