import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export { bearingDegrees, haversineMeters } from "../src/lib/utils"
export { badgesFromXp, levelFromXp } from "../src/lib/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
