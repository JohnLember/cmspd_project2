export const PAGE_SIZE = 10;

// Windowed page numbers: first, last, current ±1, with "…" gaps for big sets.
export function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  if (current > 3) pages.push("start-ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("end-ellipsis");
  pages.push(total);
  return pages;
}
