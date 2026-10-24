// PostgreSQL NUMERIC(19,4): keep ledger arithmetic and request amounts exact.
const SCALE = BigInt(10000);
export function amountToUnits(value: string | number): bigint {
  const text = String(value).trim();
  if (!/^-?\d+(?:\.\d{1,4})?$/.test(text)) throw new Error('Use a decimal amount with up to four decimal places.');
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = text.replace(/^-/, '').split('.');
  const units = BigInt(whole) * SCALE + BigInt(fraction.padEnd(4, '0'));
  return negative ? -units : units;
}
export function unitsToAmount(units: bigint): string {
  const negative = units < BigInt(0);
  const absolute = negative ? -units : units;
  return `${negative ? '-' : ''}${absolute / SCALE}.${String(absolute % SCALE).padStart(4, '0')}`;
}
export function paymentAmount(value: string | number): string {
  const units = amountToUnits(value);
  if (units <= BigInt(0)) throw new Error('Enter a positive amount.');
  if (units > BigInt('9999999999999999999')) throw new Error('Amount exceeds the backend NUMERIC(19,4) limit.');
  return unitsToAmount(units);
}
export function sumAmounts(values: (string | number)[]): string {
  return unitsToAmount(values.reduce<bigint>((sum, value) => sum + amountToUnits(value), BigInt(0)));
}
export function formatMoney(value: string | number): string {
  const units = amountToUnits(value);
  const absolute = units < BigInt(0) ? -units : units;
  const fraction = String(absolute % SCALE).padStart(4, '0').replace(/0{1,2}$/, '');
  return `${units < BigInt(0) ? '-' : ''}$${(absolute / SCALE).toLocaleString('en-US')}.${fraction}`;
}
