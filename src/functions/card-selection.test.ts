import { describe, it, expect } from 'vitest';
import { selectCard, canSelectCard, clearSelectedCards } from './card-selection';
import { Card, GameState, GameStatus } from '../models/game-state';

describe('Card Selection Functions', () => {
    // Helper function to create a test game state
    const createTestGameState = (): GameState => {
        const cards: Card[] = [
            { id: 1, imageId: 1, isRevealed: false, isMatched: false },
            { id: 2, imageId: 1, isRevealed: false, isMatched: false },
            { id: 3, imageId: 2, isRevealed: false, isMatched: false },
            { id: 4, imageId: 2, isRevealed: false, isMatched: false },
            { id: 5, imageId: 3, isRevealed: false, isMatched: false },
            { id: 6, imageId: 3, isRevealed: false, isMatched: false },
        ];

        return {
            cards,
            status: GameStatus.IN_PROGRESS,
            moves: 0,
            selectedCardIds: [],
            isPreviewMode: false,
            cardStyle: 'impressionist',
            gridSize: 'easy'
        };
    };

    describe('selectCard', () => {
        it('should reveal a card and add it to selected cards', () => {
            const initialState = createTestGameState();
            const cardId = 1;

            const newState = selectCard(initialState, cardId);

            // Card should be revealed
            const updatedCard = newState.cards.find(card => card.id === cardId);
            expect(updatedCard?.isRevealed).toBe(true);

            // Card ID should be added to selected cards
            expect(newState.selectedCardIds).toContain(cardId);
        });

        it('should not increment moves when selecting first card', () => {
            const initialState = createTestGameState();
            const cardId = 1;

            const newState = selectCard(initialState, cardId);

            // Moves count should still be 0
            expect(newState.moves).toBe(0);
        });

        it('should increment moves when selecting second card', () => {
            let state = createTestGameState();

            // Select first card
            state = selectCard(state, 1);
            expect(state.moves).toBe(0);

            // Select second card
            state = selectCard(state, 3);
            expect(state.moves).toBe(1);
        });

        it('should not allow selecting a third card', () => {
            let state = createTestGameState();

            // Select first and second cards
            state = selectCard(state, 1);
            state = selectCard(state, 3);

            // Try to select a third card
            const stateBeforeThirdSelection = { ...state };
            state = selectCard(state, 5);

            // State should remain unchanged
            expect(state).toEqual(stateBeforeThirdSelection);
        });

        it('should not allow selecting an already revealed card', () => {
            let state = createTestGameState();

            // Select a card first
            state = selectCard(state, 1);

            // Try to select the same card again
            const stateBeforeSecondSelection = { ...state };
            state = selectCard(state, 1);

            // State should remain unchanged
            expect(state).toEqual(stateBeforeSecondSelection);
        });

        it('should not allow selecting a matched card', () => {
            let state = createTestGameState();

            // Mark a card as matched and revealed
            state = {
                ...state,
                cards: state.cards.map(card =>
                    card.id === 1
                        ? { ...card, isMatched: true, isRevealed: true }
                        : card
                )
            };

            // Try to select the matched card
            const stateBeforeSelection = { ...state };
            state = selectCard(state, 1);

            // State should remain unchanged
            expect(state).toEqual(stateBeforeSelection);
        });

        it('should handle non-existent card IDs gracefully', () => {
            const state = createTestGameState();

            // Try to select a card that doesn't exist
            const stateBeforeSelection = { ...state };
            const newState = selectCard(state, 999);

            // State should remain unchanged
            expect(newState).toEqual(stateBeforeSelection);
        });
    });

    describe('canSelectCard', () => {
        it('should return true for a valid card selection', () => {
            const state = createTestGameState();

            // Card exists, is not revealed, not matched, and less than 2 selected
            expect(canSelectCard(state, 1)).toBe(true);
        });

        it('should return false when 2 cards are already selected', () => {
            let state = createTestGameState();

            // Select two cards
            state = selectCard(state, 1);
            state = selectCard(state, 3);

            // Should not be able to select another card
            expect(canSelectCard(state, 5)).toBe(false);
        });

        it('should return false for a card that is already revealed', () => {
            let state = createTestGameState();

            // Reveal a card
            state = selectCard(state, 1);

            // Should not be able to select it again
            expect(canSelectCard(state, 1)).toBe(false);
        });

        it('should return false for a card that is already matched', () => {
            let state = createTestGameState();

            // Mark a card as matched
            state = {
                ...state,
                cards: state.cards.map(card =>
                    card.id === 1
                        ? { ...card, isMatched: true }
                        : card
                )
            };

            // Should not be able to select a matched card
            expect(canSelectCard(state, 1)).toBe(false);
        });

        it('should return false for a non-existent card ID', () => {
            const state = createTestGameState();

            // Card doesn't exist
            expect(canSelectCard(state, 999)).toBe(false);
        });
    });

    describe('clearSelectedCards', () => {
        it('should hide all revealed cards that are not matched', () => {
            let state = createTestGameState();

            // Select two cards
            state = selectCard(state, 1);
            state = selectCard(state, 3);

            // Clear selected cards
            state = clearSelectedCards(state);

            // All cards should be hidden
            state.cards.forEach(card => {
                expect(card.isRevealed).toBe(false);
            });

            // Selected card IDs should be cleared
            expect(state.selectedCardIds).toEqual([]);
        });

        it('should not hide matched cards', () => {
            let state = createTestGameState();

            // Mark a card as matched and revealed
            state = {
                ...state,
                cards: state.cards.map(card =>
                    card.id === 1
                        ? { ...card, isMatched: true, isRevealed: true }
                        : card
                ),
                selectedCardIds: [3] // Select another non-matched card
            };

            // Reveal another non-matched card
            state = selectCard(state, 3);

            // Clear selected cards
            state = clearSelectedCards(state);

            // Matched card should still be revealed
            const matchedCard = state.cards.find(card => card.id === 1);
            expect(matchedCard?.isRevealed).toBe(true);

            // Non-matched card should be hidden
            const nonMatchedCard = state.cards.find(card => card.id === 3);
            expect(nonMatchedCard?.isRevealed).toBe(false);

            // Selected card IDs should be cleared
            expect(state.selectedCardIds).toEqual([]);
        });
    });
}); 