/**
 * Game State Update Functions
 * 
 * Pure functions for updating the overall game state based on the current state.
 */

import { GameState, GameStatus, Card } from '../models/game-state';
import { processMatches } from './match-checking';
import { clearSelectedCards } from './card-selection';

/**
 * Updates the game state after cards have been selected
 * This handles the game logic flow for checking matches and updating state
 * 
 * @param state Current game state
 * @returns New game state with updated matches, completed status, etc.
 */
export const updateGameState = (state: GameState): GameState => {
    // If there aren't exactly 2 cards selected, no processing needed
    if (state.selectedCardIds.length !== 2) {
        return state;
    }

    // Process matches first
    const stateWithMatches = processMatches(state);

    // Check if we just completed the game
    if (stateWithMatches.status === GameStatus.COMPLETED) {
        return stateWithMatches;
    }

    // If the cards didn't match, clear the selection (in a real game, this would happen after a delay)
    // In our pure function world, we'll just handle both cases here
    if (stateWithMatches.selectedCardIds.length === 2) {
        return clearSelectedCards(stateWithMatches);
    }

    return stateWithMatches;
};

/**
 * Resets the game state to a new game
 * 
 * @param state Current game state
 * @param shuffleFunction Optional function to shuffle the cards
 * @returns New game state with reset cards and game status
 */
export const resetGameState = (
    state: GameState,
    shuffleFunction?: (cards: Card[]) => Card[]
): GameState => {
    // Create a fresh set of cards based on the current number of cards
    const totalPairs = state.cards.length / 2;

    // Create all the card pairs
    const cards: Card[] = [];
    for (let imageId = 1; imageId <= totalPairs; imageId++) {
        // First card of the pair
        cards.push({
            id: (imageId * 2) - 1,
            imageId,
            isRevealed: false,
            isMatched: false
        });

        // Second card of the pair
        cards.push({
            id: imageId * 2,
            imageId,
            isRevealed: false,
            isMatched: false
        });
    }

    // Shuffle the cards if a shuffle function is provided
    const shuffledCards = shuffleFunction ? shuffleFunction(cards) : cards;

    // Return a new game state with the reset and shuffled cards
    return {
        cards: shuffledCards,
        status: GameStatus.IN_PROGRESS,
        moves: 0,
        selectedCardIds: []
    };
}; 