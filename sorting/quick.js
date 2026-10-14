SORTS.push({
  id: 'quick', name: 'Quick sort',
  problem: `Put a list of numbers in increasing order. Quick sort picks a pivot value and partitions the list: everything
    smaller goes to the left of the pivot, everything else to the right. The pivot is then in its final place, and
    each side is sorted the same way. It averages n log n time and is one of the fastest sorts in practice.`,
  code: [
    'quickSort(lo, hi):',
    '  if lo >= hi: return',
    '  pivot = a[hi]; i = lo',
    '  for j in lo..hi-1:',
    '    if a[j] < pivot: swap(a[i], a[j]); i++',
    '  swap(a[i], a[hi])        # pivot is final',
    '  quickSort(lo, i-1); quickSort(i+1, hi)',
  ],
  run(a, step) {
    const n = a.length, done = [];
    let cmp = 0, swaps = 0;
    const st = extra => ({ comparisons: cmp, swaps, ...extra });
    const zones = (lo, i, hi) => Object.fromEntries([...Array(i - lo).keys()].map(k => [lo + k, 'left']).concat([[hi, 'pivot']]));
    step({ line: -1, why: `Pick a pivot, split the list around it, then repeat on each side.`, state: st() });
    (function qs(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) {
        done.push(lo);
        step({ line: 1, done: [...done], state: st(), why: `Position ${lo + 1} is a part with one value, so ${a[lo].v} is already in its final place.` });
        return;
      }
      const p = a[hi].v;
      let i = lo;
      step({ line: 2, range: [lo, hi + 1], hi: zones(lo, i, hi), done: [...done], state: st({ pivot: p, i: i + 1 }),
        why: `Partition positions ${lo + 1}–${hi + 1} around the pivot ${p} (the last value). Values smaller than ${p} will collect on the left.` });
      for (let j = lo; j < hi; j++) {
        const v = a[j].v, less = v < p;
        cmp++;
        if (less) { if (i !== j) swaps++; [a[i], a[j]] = [a[j], a[i]]; i++; }
        const hiMap = zones(lo, i, hi);
        hiMap[less ? i - 1 : j] = less ? 'swap' : 'cmp';
        step({ line: 4, range: [lo, hi + 1], hi: hiMap, done: [...done], state: st({ pivot: p, j: j + 1, 'a[j]': v, 'left zone size': i - lo }),
          why: less ? `${v} < ${p}: it belongs left of the pivot, so it joins the left zone (position ${i}).` : `${v} ≥ ${p}: it belongs right of the pivot, so it stays where it is.`,
          predict: { question: `${v} vs pivot ${p}: which side does it belong on?`, options: ['Left (smaller)', 'Right (not smaller)'], answer: less ? 'Left (smaller)' : 'Right (not smaller)' } });
      }
      if (i !== hi) swaps++;
      [a[i], a[hi]] = [a[hi], a[i]];
      done.push(i);
      step({ line: 5, range: [lo, hi + 1], hi: { [i]: 'swap' }, done: [...done], state: st({ pivot: p }),
        why: `Put the pivot ${p} right after the left zone, at position ${i + 1}. Everything left of it is smaller and everything right is not, so ${p} is final.`,
        predict: { question: `The scan is done. At which position does the pivot ${p} land?`, options: [...Array(hi - lo + 1).keys()].map(k => `Position ${lo + k + 1}`), answer: `Position ${i + 1}` } });
      qs(lo, i - 1);
      qs(i + 1, hi);
    })(0, n - 1);
    step({ line: -1, done: [...a.keys()], state: st(), why: `Sorted! ${cmp} comparisons and ${swaps} swaps.` });
  },
});
