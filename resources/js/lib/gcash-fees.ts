// Preview only — the server always recomputes and locks the fee at creation time.

export type FeeBracket = { min_amount: number; max_amount: number; fee: number };

function feeFor(brackets: FeeBracket[], amount: number): number | null {
    const bracket = brackets.find(
        (b) => amount >= b.min_amount && amount <= b.max_amount,
    );

    return bracket ? bracket.fee : null;
}

function minAmount(brackets: FeeBracket[]): number {
    return brackets.length > 0 ? Math.min(...brackets.map((b) => b.min_amount)) : 1;
}

function maxAmount(brackets: FeeBracket[]): number {
    return brackets.length > 0 ? Math.max(...brackets.map((b) => b.max_amount)) : 9999;
}

export { feeFor, minAmount, maxAmount };
