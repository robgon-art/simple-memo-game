import { describe, it, expect } from 'vitest';
import { shuffleCards, seededShuffleCards } from './shuffle';
import { Card } from '../models/game-state';

describe('Card Shuffling Functions', () => {
    // Create sample card arrays for testing
    const createTestCards = (count: number): Card[] => {
        const cards: Card[] = [];
        for (let i = 1; i <= count; i++) {
            cards.push({
                id: i,
                imageId: Math.ceil(i / 2),
                isRevealed: false,
                isMatched: false
            });
        }
        return cards;
    };

    describe('shuffleCards', () => {
        it('should return a new array with the same cards but in a different order', () => {
            const originalCards = createTestCards(10);
            const shuffledCards = shuffleCards(originalCards);

            // The shuffled array should be a new array, not the same reference
            expect(shuffledCards).not.toBe(originalCards);

            // The shuffled array should have the same length
            expect(shuffledCards.length).toBe(originalCards.length);

            // The shuffled array should contain all the original cards
            // Compare IDs since cards are objects and we want to check identity, not equality
            const originalIds = originalCards.map(card => card.id).sort();
            const shuffledIds = shuffledCards.map(card => card.id).sort();
            expect(shuffledIds).toEqual(originalIds);

            // This test may occasionally fail due to random chance if the shuffle
            // produces the same order, but that's extremely unlikely with enough cards
            if (originalCards.length >= 10) {
                expect(
                    shuffledCards.some((card, index) => card.id !== originalCards[index].id)
                ).toBe(true);
            }
        });

        it('should not mutate the original array', () => {
            const originalCards = createTestCards(6);
            const originalCardsCopy = [...originalCards];

            shuffleCards(originalCards);

            // The original array should remain unchanged
            expect(originalCards).toEqual(originalCardsCopy);
        });

        it('should handle empty arrays', () => {
            const emptyArray: Card[] = [];
            const shuffled = shuffleCards(emptyArray);

            expect(shuffled).toEqual([]);
            expect(shuffled).not.toBe(emptyArray); // Still a new array
        });

        it('should handle arrays with a single element', () => {
            const singleCard = createTestCards(1);
            const shuffled = shuffleCards(singleCard);

            expect(shuffled).toEqual(singleCard);
            expect(shuffled).not.toBe(singleCard); // Still a new array
        });
    });

    describe('seededShuffleCards', () => {
        it('should produce the same shuffle with the same seed', () => {
            const originalCards = createTestCards(10);
            const firstShuffle = seededShuffleCards(originalCards, 12345);
            const secondShuffle = seededShuffleCards(originalCards, 12345);

            // Both shuffles should be identical when using the same seed
            expect(firstShuffle).toEqual(secondShuffle);
        });

        it('should produce different shuffles with different seeds', () => {
            const originalCards = createTestCards(10);
            const firstShuffle = seededShuffleCards(originalCards, 12345);
            const secondShuffle = seededShuffleCards(originalCards, 67890);

            // With enough cards, different seeds should produce different shuffles
            expect(
                firstShuffle.some((card, index) => card.id !== secondShuffle[index].id)
            ).toBe(true);
        });

        it('should not mutate the original array', () => {
            const originalCards = createTestCards(6);
            const originalCardsCopy = [...originalCards];

            seededShuffleCards(originalCards, 12345);

            // The original array should remain unchanged
            expect(originalCards).toEqual(originalCardsCopy);
        });
    });
}); 