SORTS.push({
  id: 'bubble', name: 'Bubble sort',
  problem: `Put a list of numbers in increasing order. Bubble sort is the simplest idea: walk through the list comparing
    each pair of neighbours and swap them if they are out of order. Every pass carries the largest remaining value to
    the end, like a bubble rising. It is easy to follow but slow: about n² comparisons for n values.`,
  code: [
    'for end = n-1 down to 1:',
    '  for i in 0..end-1:',
    '    if a[i] > a[i+1]:',
    '      swap(a[i], a[i+1])',
    '  a[end] is now final',
    '  if no swaps this pass: stop',
  ],
  run(a, step) {
    const n = a.length, done = [];
    let cmp = 0, swaps = 0;
    const st = extra => ({ comparisons: cmp, swaps, ...extra });
    step({ line: -1, why: `Each pass compares neighbours left to right and swaps any pair that is out of order.`, state: st() });
    for (let end = n - 1; end > 0; end--) {
      let swapped = false;
      for (let i = 0; i < end; i++) {
        const x = a[i].v, y = a[i + 1].v, swap = x > y;
        cmp++;
        step({ line: 2, hi: { [i]: 'cmp', [i + 1]: 'cmp' }, done: [...done], state: st({ pass: n - end, i, 'a[i]': x, 'a[i+1]': y }),
          why: swap ? `${x} > ${y}: the bigger value is on the left, so they are out of order.` : `${x} ≤ ${y}: already in order, so leave them.`,
          predict: { question: `Compare ${x} and ${y}. Swap them or keep them?`, options: ['Swap', 'Keep'], answer: swap ? 'Swap' : 'Keep' } });
        if (swap) {
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          swaps++; swapped = true;
          step({ line: 3, hi: { [i]: 'swap', [i + 1]: 'swap' }, done: [...done], state: st({ pass: n - end, i }),
            why: `Swap: ${x} moves right. The largest value seen this pass keeps travelling toward the end.` });
        }
      }
      if (!swapped) {
        done.push(...Array(end + 1).keys());
        step({ line: 5, done: [...done], state: st(), why: `A whole pass without a single swap means every neighbour pair is in order, so the list is already sorted. Stop early.` });
        break;
      }
      done.push(end);
      step({ line: 4, done: [...done], state: st({ pass: n - end }), why: `Pass done: ${a[end].v} is the largest of the unsorted part, so it has bubbled to position ${end + 1} and will never move again.` });
    }
    step({ line: -1, done: [...a.keys()], state: st(), why: `Sorted! ${cmp} comparisons and ${swaps} swaps.` });
  },
});
