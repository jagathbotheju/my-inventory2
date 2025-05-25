import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};

export const paymentModes = [
  { value: "credit", label: "Credit" },
  { value: "cash", label: "Cash" },
  { value: "cash-cheque", label: "Cash&Cheque" },
];

export const getFullMonth = (month: number) => {
  return month === 1
    ? "January"
    : month === 2
    ? "February"
    : month === 3
    ? "March"
    : month === 4
    ? "April"
    : month === 5
    ? "May"
    : month === 6
    ? "Jun"
    : month === 7
    ? "July"
    : month === 8
    ? "August"
    : month === 9
    ? "September"
    : month === 10
    ? "October"
    : month === 11
    ? "November"
    : "December";
};
