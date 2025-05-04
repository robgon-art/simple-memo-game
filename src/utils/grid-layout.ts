export interface GridLayout {
    columns: number;
    rows: number;
    totalCells: number;
}

/**
 * Calculates the optimal grid layout for a given number of pairs
 * @param numPairs Number of pairs (2-12)
 * @returns GridLayout object with optimal dimensions
 */
export function calculateGridLayout(numPairs: number): GridLayout {
    // Define possible layouts for different numbers of pairs
    const layouts: { [key: number]: GridLayout } = {
        2: { columns: 4, rows: 1, totalCells: 4 },
        3: { columns: 5, rows: 2, totalCells: 10 },
        4: { columns: 5, rows: 2, totalCells: 10 },
        5: { columns: 5, rows: 2, totalCells: 10 },
        6: { columns: 8, rows: 2, totalCells: 16 },
        7: { columns: 8, rows: 2, totalCells: 16 },
        8: { columns: 8, rows: 2, totalCells: 16 },
        9: { columns: 8, rows: 3, totalCells: 24 },
        10: { columns: 8, rows: 3, totalCells: 24 },
        11: { columns: 8, rows: 3, totalCells: 24 },
        12: { columns: 8, rows: 3, totalCells: 24 }
    };

    // Validate input
    if (numPairs < 2 || numPairs > 12) {
        throw new Error('Number of pairs must be between 2 and 12');
    }

    return layouts[numPairs];
}

/**
 * Calculates responsive grid layouts for different screen sizes
 * @param numPairs Number of pairs (2-12)
 * @returns Object containing grid layouts for different breakpoints
 */
export function calculateResponsiveGridLayouts(numPairs: number): {
    default: GridLayout;
    large: GridLayout;
    medium: GridLayout;
    small: GridLayout;
    mobile: GridLayout;
} {
    const totalCards = numPairs * 2;

    // Helper function to find the best layout for a given number of cards
    const findBestLayout = (maxColumns: number): GridLayout => {
        const rows = Math.ceil(totalCards / maxColumns);
        return {
            columns: maxColumns,
            rows,
            totalCells: maxColumns * rows
        };
    };

    return {
        default: calculateGridLayout(numPairs),
        large: numPairs === 12 ? { columns: 8, rows: 3, totalCells: 24 } : findBestLayout(6),
        medium: findBestLayout(4),
        small: findBestLayout(3),
        mobile: findBestLayout(2)
    };
} 