export type PrintServiceType = 'mono' | 'color' | 'photo' | 'scan' | 'photocopy';
export type PrintPaperSize = 'short' | 'a4' | 'long' | 'photo_full' | 'photo_half';

const PRICES: Record<PrintServiceType, Partial<Record<PrintPaperSize, number>>> = {
    mono:      { short: 2, a4: 3, long: 3 },
    color:     { short: 3, a4: 5, long: 5 },
    photo:     { photo_full: 15, photo_half: 10 },
    scan:      { short: 2, a4: 3, long: 3 },
    photocopy: { short: 2, a4: 3, long: 3 },
};

export function priceFor(serviceType: PrintServiceType, paperSize: PrintPaperSize): number | null {
    return PRICES[serviceType]?.[paperSize] ?? null;
}

export function sizesFor(serviceType: PrintServiceType): PrintPaperSize[] {
    return Object.keys(PRICES[serviceType] ?? {}) as PrintPaperSize[];
}
