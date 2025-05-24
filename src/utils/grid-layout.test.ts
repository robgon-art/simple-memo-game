import { describe, it, expect } from 'vitest';
import { calculateGridLayout, calculateResponsiveGridLayouts } from './grid-layout';

// Test cases for calculateGridLayout
const layoutCases = [
    { numPairs: 2, expected: { columns: 4, rows: 1, totalCells: 4 } },
    { numPairs: 3, expected: { columns: 5, rows: 2, totalCells: 10 } },
    { numPairs: 4, expected: { columns: 5, rows: 2, totalCells: 10 } },
    { numPairs: 5, expected: { columns: 5, rows: 2, totalCells: 10 } },
    { numPairs: 6, expected: { columns: 8, rows: 2, totalCells: 16 } },
    { numPairs: 7, expected: { columns: 8, rows: 2, totalCells: 16 } },
    { numPairs: 8, expected: { columns: 8, rows: 2, totalCells: 16 } },
    { numPairs: 9, expected: { columns: 8, rows: 3, totalCells: 24 } },
    { numPairs: 10, expected: { columns: 8, rows: 3, totalCells: 24 } },
    { numPairs: 11, expected: { columns: 8, rows: 3, totalCells: 24 } },
    { numPairs: 12, expected: { columns: 8, rows: 3, totalCells: 24 } },
];

describe('calculateGridLayout', () => {
    layoutCases.forEach(({ numPairs, expected }) => {
        it(`returns correct layout for numPairs=${numPairs}`, () => {
            expect(calculateGridLayout(numPairs)).toEqual(expected);
        });
    });

    it('throws error for numPairs < 2', () => {
        expect(() => calculateGridLayout(1)).toThrow('Number of pairs must be between 2 and 12');
    });

    it('throws error for numPairs > 12', () => {
        expect(() => calculateGridLayout(13)).toThrow('Number of pairs must be between 2 and 12');
    });
});

describe('calculateResponsiveGridLayouts', () => {
    it('returns correct layouts for numPairs=4', () => {
        const result = calculateResponsiveGridLayouts(4);
        expect(result.default).toEqual({ columns: 5, rows: 2, totalCells: 10 });
        expect(result.large).toEqual({ columns: 6, rows: 2, totalCells: 12 });
        expect(result.medium).toEqual({ columns: 4, rows: 2, totalCells: 8 });
        expect(result.small).toEqual({ columns: 3, rows: 3, totalCells: 9 });
        expect(result.mobile).toEqual({ columns: 2, rows: 4, totalCells: 8 });
    });

    it('returns correct layouts for numPairs=12 (edge case)', () => {
        const result = calculateResponsiveGridLayouts(12);
        expect(result.default).toEqual({ columns: 8, rows: 3, totalCells: 24 });
        expect(result.large).toEqual({ columns: 8, rows: 3, totalCells: 24 });
        expect(result.medium).toEqual({ columns: 4, rows: 6, totalCells: 24 });
        expect(result.small).toEqual({ columns: 3, rows: 8, totalCells: 24 });
        expect(result.mobile).toEqual({ columns: 2, rows: 12, totalCells: 24 });
    });
}); 