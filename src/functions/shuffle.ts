/**
 * Card Shuffling Function (Fisher-Yates algorithm)
 * 
 * Implements Fisher-Yates (also known as Knuth) shuffle algorithm
 * to randomize the order of cards in a deck.
 */

import { Card } from '../models/game-state';

/**
 * Shuffles an array of cards using the Fisher-Yates algorithm
 * This algorithm runs in O(n) time and shuffles the array in-place
 * 
 * @param cards Array of cards to shuffle
 * @returns A new array containing the shuffled cards
 */
export const shuffleCards = (cards: Card[]): Card[] => {
    // Create a copy of the cards array to avoid mutating the original
    const shuffledCards = [...cards];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledCards.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements at indices i and j
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    return shuffledCards;
};

/**
 * A deterministic version of the shuffle function that uses a seed
 * This is primarily useful for testing purposes
 * 
 * @param cards Array of cards to shuffle
 * @param seed Seed value for the random number generator
 * @returns A new array containing the shuffled cards
 */
export const seededShuffleCards = (cards: Card[], seed: number): Card[] => {
    // Create a copy of the cards array to avoid mutating the original
    const shuffledCards = [...cards];

    // Create a seeded random function
    const seededRandom = (max: number): number => {
        // Simple seeded random number generator
        // Note: This is not cryptographically secure, but sufficient for testing
        seed = (seed * 9301 + 49297) % 233280;
        return (seed / 233280) * max;
    };

    // Fisher-Yates shuffle algorithm with seeded random
    for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    return shuffledCards;
}; 