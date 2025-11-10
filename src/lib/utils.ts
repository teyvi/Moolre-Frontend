import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

  // Helper function to map network to channel number
  export const getChannelFromNetwork = (network: string): number => {
    switch (network) {
      case 'mtn': return 1;
      case 'vodafone': return 6;
      case 'airteltigo': return 7;
      default: return 1; //check on a better default
    }
  };


  // Helper function to generate external reference
  export const generateExternalRef = (): string => {
    return `MOORLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };