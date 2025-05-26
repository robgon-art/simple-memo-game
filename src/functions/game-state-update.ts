/**
 * Game State Update Functions
 * 
 * Pure functions for updating the overall game state based on the current state.
 */

import { GameState, GameStatus, Card, initializeGame } from '../models/game-state';
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
    if (stateWithMatches.status === GameStatus.VICTORY_MUSIC) {
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
    const totalPairs = state.cards.length / 2;
    return {
        ...initializeGame(totalPairs, shuffleFunction),
        status: GameStatus.READY
    };
}; 