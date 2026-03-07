import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function parseItemName(fullName) {
    if (!fullName) return { main: '', variant: '', extras: '' };

    // Pattern: "Name (Variant) + Extra1 + Extra2"
    const parts = fullName.split(' + ');
    const mainPart = parts[0];
    const extras = parts.slice(1).join(' + ');

    const variantMatch = mainPart.match(/(.*?)\s?\((.*?)\)$/);
    if (variantMatch) {
        return {
            main: variantMatch[1].trim(),
            variant: variantMatch[2].trim(),
            extras: extras ? extras.trim() : ''
        };
    }

    return {
        main: mainPart.trim(),
        variant: '',
        extras: extras ? extras.trim() : ''
    };
}
