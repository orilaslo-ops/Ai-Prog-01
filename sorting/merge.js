SORTS.push({
  id: 'merge', name: 'Merge sort',
  problem: `Put a list of numbers in increasing order. Merge sort splits the list in half, sorts each half, then merges
    the two sorted halves by repeatedly taking the smaller front value. Splitting in half gives about log n levels,
    and each level does n work, so it takes n log n time even in the worst case, much faster than n² for big lists.`,
  code: [
    'mergeSort(lo, hi):',
    '  if hi - lo <= 1: return',
    '  mid = (lo + hi) / 2',
    '  mergeSort(lo, mid); mergeSort(mid, hi)',
    '  merge: take the smaller front value until both halves are empty',
  ],
  run(a, step) {
    const n = a.length;
    let cmp = 0, writes = 0;
    const st = extra => ({ comparisons: cmp, writes, ...extra });
    const sides = (lo, mid, hi, from = lo) => Object.fromEntries([...Array(hi - from).keys()].map(k => [from + k, from + k < mid ? 'left' : 'right']));
    step({ line: -1, why: `Divide and conquer: split until each piece has one value (already sorted), then merge pieces back together.`, state: st() });
    (function sort(lo, hi, depth) {
      if (hi - lo <= 1) return;
      const mid = (lo + hi) >> 1;
      step({ line: 2, range: [lo, hi], hi: sides(lo, mid, hi), state: st({ lo: lo + 1, hi, depth }),
        why: `Split positions ${lo + 1}–${hi} into ${lo + 1}–${mid} and ${mid + 1}–${hi}. Each half is sorted first, then they are merged.` });
      sort(lo, mid, depth + 1);
      sort(mid, hi, depth + 1);
      const L = a.slice(lo, mid), R = a.slice(mid, hi), out = [];
      step({ line: 4, range: [lo, hi], hi: sides(lo, mid, hi), state: st({ lo: lo + 1, hi, depth }),
        why: `Both halves are sorted: [${L.map(x => x.v)}] and [${R.map(x => x.v)}]. Merge them by comparing their front values.` });
      while (L.length && R.length) {
        const x = L[0].v, y = R[0].v, takeL = x <= y, labels = [`${x} (left)`, `${y} (right)`];
        cmp++; writes++;
        out.push(takeL ? L.shift() : R.shift());
        a.splice(lo, hi - lo, ...out, ...L, ...R);
        const hiMap = sides(lo, lo + out.length + L.length, hi, lo + out.length);
        hiMap[lo + out.length - 1] = 'swap';
        step({ line: 4, range: [lo, hi], hi: hiMap, state: st({ left: x, right: y, merged: out.map(z => z.v).join(' ') }),
          why: takeL ? `${x} ≤ ${y}: take ${x} from the left half.` + (x === y ? ' On a tie the left one goes first, which keeps equal values in their original order.' : '') : `${y} < ${x}: take ${y} from the right half.`,
          predict: { question: `Front values are ${x} (left) and ${y} (right). Which one is taken next?`, options: labels, answer: labels[takeL ? 0 : 1] } });
      }
      if (L.length || R.length) {
        const rest = L.length ? 'left' : 'right';
        writes += L.length + R.length;
        out.push(...L, ...R);
        a.splice(lo, hi - lo, ...out);
        step({ line: 4, range: [lo, hi], state: st({ merged: out.map(z => z.v).join(' ') }),
          why: `The ${rest === 'left' ? 'right' : 'left'} half is used up, so the rest of the ${rest} half, already sorted, goes on the end. Positions ${lo + 1}–${hi} are now sorted.` });
      }
    })(0, n, 0);
    step({ line: -1, done: [...a.keys()], state: st(), why: `Sorted! ${cmp} comparisons and ${writes} writes.` });
  },
});
