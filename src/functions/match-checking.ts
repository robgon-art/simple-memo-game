/**
 * Match Checking Functions
 * 
 * Pure functions for checking if cards match in the memory game.
 */

import { GameState, GameStatus } from '../models/game-state';
import { audioManager } from '../managers/audio-manager';

// Create audio object for match sound
const matchSound = new Audio('/aero-chime-one-shot.mp3');

/**
 * Checks if the two selected cards match based on their imageId
 * 
 * @param state Current game state
 * @returns True if the selected cards match, false otherwise or if fewer than 2 cards are selected
 */
export const doSelectedCardsMatch = (state: GameState): boolean => {
    const { selectedCardIds, cards } = state;

    // Need exactly 2 selected cards to check for a match
    if (selectedCardIds.length !== 2) {
        return false;
    }

    const [firstCardId, secondCardId] = selectedCardIds;

    // Find the selected cards
    const firstCard = cards.find(card => card.id === firstCardId);
    const secondCard = cards.find(card => card.id === secondCardId);

    // If either card is not found, there's no match
    if (!firstCard || !secondCard) {
        return false;
    }

    // Return true if the image IDs match
    return firstCard.imageId === secondCard.imageId;
};

/**
 * Checks if all cards in the game are matched
 * 
 * @param state Current game state
 * @returns True if all cards are matched, false otherwise
 */
export const areAllCardsMatched = (state: GameState): boolean => {
    return state.cards.every(card => card.isMatched);
};

/**
 * Processes the selected cards in the game state, marking them as matched if they match
 * 
 * @param state Current game state
 * @returns New game state with updated card matches and possibly updated game status
 */
export const processMatches = (state: GameState): GameState => {
    // Only process if exactly 2 cards are selected
    if (state.selectedCardIds.length !== 2) {
        return state;
    }

    // Check if the selected cards match
    const isMatch = doSelectedCardsMatch(state);

    // Play match sound if cards match
    if (isMatch) {
        // Check if this is the final match
        const willBeCompleted = state.cards.filter(card => 
            card.isMatched || state.selectedCardIds.includes(card.id)
        ).length === state.cards.length;

        if (willBeCompleted) {
            // For final match, play victory sound after match sound
            matchSound.onended = () => {
                audioManager.playMusic('gameComplete');
            };
        } else {
            // For regular matches, clear any previous onended handler
            matchSound.onended = null;
        }

        matchSound.play().catch(error => {
            console.error('Error playing match sound:', error);
        });
    }

    // Update cards based on the match result
    const updatedCards = state.cards.map(card => {
        // If this card is one of the selected cards and they match
        if (isMatch && state.selectedCardIds.includes(card.id)) {
            return { ...card, isMatched: true };
        }

        // Otherwise keep the card as is
        return card;
    });

    // Check if all cards are matched after this update
    const allMatched = updatedCards.every(card => card.isMatched);

    // Update the game state
    return {
        ...state,
        cards: updatedCards,
        status: allMatched ? GameStatus.COMPLETED : state.status,
        // Clear selected cards if they match, otherwise keep them selected
        selectedCardIds: isMatch ? [] : state.selectedCardIds
    };
}; 