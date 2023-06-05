export function calculateDarf(
  saleTotalOperation: number,
  grossProfit: number,
  irrf: number,
): number {
  const TAX_RATE = 0.15;
  const MIN_SALE_TOTAL = 20000;

  if (saleTotalOperation >= MIN_SALE_TOTAL && grossProfit > 0) {
    return (grossProfit - irrf) * TAX_RATE;
  }

  return 0;
}
