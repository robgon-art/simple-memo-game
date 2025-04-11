/**
 * Card Selection Logic
 * 
 * Pure functions for handling card selection in the memory game.
 */

import { GameState } from '../models/game-state';

/**
 * Selects a card in the game state and handles the selection logic
 * 
 * @param state Current game state
 * @param cardId ID of the card to select
 * @returns New game state with the card selected and revealed
 */
export const selectCard = (state: GameState, cardId: number): GameState => {
    // Don't allow selecting more than 2 cards at a time
    if (state.selectedCardIds.length >= 2) {
        return state;
    }

    // Find the card in the state
    const targetCard = state.cards.find(card => card.id === cardId);

    // If card doesn't exist, return unchanged state
    if (!targetCard) {
        return state;
    }

    // Don't allow selecting cards that are already matched or revealed
    if (targetCard.isMatched || targetCard.isRevealed) {
        return state;
    }

    // Create a new array of cards with the selected card revealed
    const updatedCards = state.cards.map(card =>
        card.id === cardId
            ? { ...card, isRevealed: true }
            : card
    );

    // Update selected card IDs
    const updatedSelectedCardIds = [...state.selectedCardIds, cardId];

    // Increment moves counter when selecting the second card
    const updatedMoves = updatedSelectedCardIds.length === 2
        ? state.moves + 1
        : state.moves;

    // Return new state with updated cards, selected card IDs, and moves
    return {
        ...state,
        cards: updatedCards,
        selectedCardIds: updatedSelectedCardIds,
        moves: updatedMoves
    };
};

/**
 * Determines if a card can be selected based on the current game state
 * 
 * @param state Current game state
 * @param cardId ID of the card to check
 * @returns True if the card can be selected, false otherwise
 */
export const canSelectCard = (state: GameState, cardId: number): boolean => {
    // Can't select cards if 2 are already selected
    if (state.selectedCardIds.length >= 2) {
        return false;
    }

    // Find the card
    const card = state.cards.find(c => c.id === cardId);

    // Card must exist, and not be already matched or revealed
    return !!card && !card.isMatched && !card.isRevealed;
};

/**
 * Clears all selected cards, resetting them to face down (unless matched)
 * 
 * @param state Current game state
 * @returns New game state with all non-matched cards hidden and selection cleared
 */
export const clearSelectedCards = (state: GameState): GameState => {
    // Hide all revealed cards that aren't matched
    const updatedCards = state.cards.map(card =>
        (card.isRevealed && !card.isMatched)
            ? { ...card, isRevealed: false }
            : card
    );

    // Clear selected card IDs
    return {
        ...state,
        cards: updatedCards,
        selectedCardIds: []
    };
}; 