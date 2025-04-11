import { describe, it, expect } from 'vitest';
import { doSelectedCardsMatch, areAllCardsMatched, processMatches } from './match-checking';
import { Card, GameState, GameStatus } from '../models/game-state';

describe('Match Checking Functions', () => {
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
            selectedCardIds: []
        };
    };

    describe('doSelectedCardsMatch', () => {
        it('should return true when selected cards have the same imageId', () => {
            let state = createTestGameState();

            // Select two cards with the same imageId (1 and 2 have imageId 1)
            state = {
                ...state,
                selectedCardIds: [1, 2]
            };

            expect(doSelectedCardsMatch(state)).toBe(true);
        });

        it('should return false when selected cards have different imageIds', () => {
            let state = createTestGameState();

            // Select two cards with different imageIds (1 has imageId 1, 3 has imageId 2)
            state = {
                ...state,
                selectedCardIds: [1, 3]
            };

            expect(doSelectedCardsMatch(state)).toBe(false);
        });

        it('should return false when fewer than 2 cards are selected', () => {
            let state = createTestGameState();

            // Select only one card
            state = {
                ...state,
                selectedCardIds: [1]
            };

            expect(doSelectedCardsMatch(state)).toBe(false);
        });

        it('should return false when an invalid card ID is selected', () => {
            let state = createTestGameState();

            // Select a non-existent card
            state = {
                ...state,
                selectedCardIds: [1, 999]
            };

            expect(doSelectedCardsMatch(state)).toBe(false);
        });
    });

    describe('areAllCardsMatched', () => {
        it('should return true when all cards are matched', () => {
            let state = createTestGameState();

            // Mark all cards as matched
            state = {
                ...state,
                cards: state.cards.map(card => ({ ...card, isMatched: true }))
            };

            expect(areAllCardsMatched(state)).toBe(true);
        });

        it('should return false when some cards are not matched', () => {
            let state = createTestGameState();

            // Mark only some cards as matched
            state = {
                ...state,
                cards: state.cards.map((card, index) => ({
                    ...card,
                    isMatched: index < 2 // Only first 2 cards are matched
                }))
            };

            expect(areAllCardsMatched(state)).toBe(false);
        });

        it('should return false when no cards are matched', () => {
            const state = createTestGameState();
            expect(areAllCardsMatched(state)).toBe(false);
        });
    });

    describe('processMatches', () => {
        it('should mark matching cards as matched', () => {
            let state = createTestGameState();

            // Select two cards with the same imageId (1 and 2 have imageId 1)
            state = {
                ...state,
                selectedCardIds: [1, 2]
            };

            const newState = processMatches(state);

            // Check that the selected cards are marked as matched
            const card1 = newState.cards.find(card => card.id === 1);
            const card2 = newState.cards.find(card => card.id === 2);

            expect(card1?.isMatched).toBe(true);
            expect(card2?.isMatched).toBe(true);

            // Other cards should not be matched
            const otherCards = newState.cards.filter(card => ![1, 2].includes(card.id));
            otherCards.forEach(card => {
                expect(card.isMatched).toBe(false);
            });
        });

        it('should not mark non-matching cards as matched', () => {
            let state = createTestGameState();

            // Select two cards with different imageIds (1 has imageId 1, 3 has imageId 2)
            state = {
                ...state,
                selectedCardIds: [1, 3]
            };

            const newState = processMatches(state);

            // Check that the selected cards are still not matched
            const card1 = newState.cards.find(card => card.id === 1);
            const card3 = newState.cards.find(card => card.id === 3);

            expect(card1?.isMatched).toBe(false);
            expect(card3?.isMatched).toBe(false);
        });

        it('should clear selected cards when they match', () => {
            let state = createTestGameState();

            // Select two cards with the same imageId (1 and 2 have imageId 1)
            state = {
                ...state,
                selectedCardIds: [1, 2]
            };

            const newState = processMatches(state);

            // Selected cards should be cleared after a match
            expect(newState.selectedCardIds).toEqual([]);
        });

        it('should not clear selected cards when they do not match', () => {
            let state = createTestGameState();

            // Select two cards with different imageIds (1 has imageId 1, 3 has imageId 2)
            state = {
                ...state,
                selectedCardIds: [1, 3]
            };

            const newState = processMatches(state);

            // Selected cards should remain selected after no match
            expect(newState.selectedCardIds).toEqual([1, 3]);
        });

        it('should update game status to COMPLETED when all cards are matched', () => {
            let state = createTestGameState();

            // Mark all cards except two as matched
            state = {
                ...state,
                cards: state.cards.map((card, index) => ({
                    ...card,
                    isMatched: index >= 2 // Only first 2 cards are not matched
                })),
                selectedCardIds: [1, 2] // Select the remaining two cards which match (both imageId 1)
            };

            const newState = processMatches(state);

            // Game status should be updated to COMPLETED
            expect(newState.status).toBe(GameStatus.COMPLETED);
        });

        it('should not update game status when not all cards are matched', () => {
            let state = createTestGameState();

            // Select two cards with the same imageId (1 and 2 have imageId 1)
            state = {
                ...state,
                selectedCardIds: [1, 2]
            };

            const newState = processMatches(state);

            // Game status should remain IN_PROGRESS
            expect(newState.status).toBe(GameStatus.IN_PROGRESS);
        });

        it('should not process anything when fewer than 2 cards are selected', () => {
            let state = createTestGameState();

            // Select only one card
            state = {
                ...state,
                selectedCardIds: [1]
            };

            const stateBeforeProcessing = { ...state };
            const newState = processMatches(state);

            // State should remain unchanged
            expect(newState).toEqual(stateBeforeProcessing);
        });
    });
}); 