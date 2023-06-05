export function calculateDifferenceInDays(startDate: Date, endDate: Date) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / oneDay);
}
