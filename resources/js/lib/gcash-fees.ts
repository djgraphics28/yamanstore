// Mirrors app/Support/GcashFeeSchedule.php and app/Support/LoadFeeSchedule.php.
// Preview only — the server always recomputes and locks the fee at creation time.

const GCASH_BRACKETS: [number, number, number][] = [
    [1, 100, 10],
    [101, 500, 15],
    [501, 1000, 20],
    [1001, 1500, 30],
    [1501, 2000, 40],
    [2001, 2500, 50],
    [2501, 3000, 60],
    [3001, 3500, 70],
    [3501, 4000, 80],
    [4001, 4500, 90],
    [4501, 5000, 100],
];

const LOAD_BRACKETS: [number, number, number][] = [
    [10, 50, 5],
    [51, 99, 10],
    [100, 150, 15],
    [151, 200, 20],
    [201, 300, 30],
    [301, 500, 50],
];

function feeFor(brackets: [number, number, number][], amount: number) {
    const bracket = brackets.find(
        ([min, max]) => amount >= min && amount <= max,
    );

    return bracket ? bracket[2] : null;
}

export const GCASH_MIN_AMOUNT = 1;
export const GCASH_MAX_AMOUNT = 5000;
export const LOAD_MIN_AMOUNT = 10;
export const LOAD_MAX_AMOUNT = 500;

export function gcashFeeFor(amount: number) {
    return feeFor(GCASH_BRACKETS, amount);
}

export function loadFeeFor(amount: number) {
    return feeFor(LOAD_BRACKETS, amount);
}
