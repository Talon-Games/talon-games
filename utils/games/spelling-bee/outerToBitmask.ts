export default function outerToBitmask(s: string): number {
  let bitmask = 0;
  for (let i = 0; i < s.length; i++) {
    bitmask |= 1 << (s.charCodeAt(i) - 97);
  }
  return bitmask;
}
