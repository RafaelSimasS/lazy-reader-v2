import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SHA256 from "crypto-js/sha256";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hashFileName = async (fileName: string): Promise<string> => {
  return SHA256(fileName).toString();
};

export const toggleTheme = (newTheme: string) => {
  document.documentElement.className = newTheme;
  localStorage.setItem("theme", newTheme);
};
