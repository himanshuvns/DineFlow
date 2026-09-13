import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "INR"
): string {
  const validAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const validCurrency = currency && currency.trim() ? currency.toUpperCase() : "INR";

  if (validCurrency === "INR") {
    return `₹${validAmount.toLocaleString("en-IN")}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: validCurrency,
    }).format(validAmount);
  } catch {
    return `${validCurrency} ${validAmount.toLocaleString("en-US")}`;
  }
}
