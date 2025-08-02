/**
 * Formátuje číslo na miliardy s "B" suffixom
 * Príklad: 3500 → "3,500 B"
 */
export const formatBillions = (num: number) =>
  Intl.NumberFormat("en-US", { 
    maximumFractionDigits: 0 
  }).format(num); 