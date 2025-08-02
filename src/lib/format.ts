/**
 * Formátuje číslo na miliardy s "B" suffixom
 * Príklad: 3500 → "3,500 B"
 */
export const formatBillions = (num: number) =>
  Intl.NumberFormat("en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(num) + " B"; 