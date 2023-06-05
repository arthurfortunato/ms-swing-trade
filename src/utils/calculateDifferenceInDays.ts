export function calculateDifferenceInDays(
  purchaseOperationDate: Date,
  saleOperationDate: Date,
) {
  const startDate = new Date(purchaseOperationDate);
  const endDate = new Date(saleOperationDate);
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / oneDay);
}
