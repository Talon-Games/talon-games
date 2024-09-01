export default function generateSimpleHash(input: string): string {
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    hash1 = (hash1 * 33) ^ charCode;
    hash2 = (hash2 * 33) ^ charCode;
  }

  const combinedHash =
    (hash1 >>> 0).toString(16).padStart(8, "0") +
    (hash2 >>> 0).toString(16).padStart(8, "0");
  return combinedHash;
}
