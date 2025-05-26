import { describe, it, expect } from 'vitest';
import { updateGameState, resetGameState } from './game-state-update';
import { Card, GameState, GameStatus } from '../models/game-state';

describe('Game State Update Functions', () => {
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

    describe('updateGameState', () => {
        it('should mark cards as matched when they have the same imageId', () => {
            let state = createTestGameState();

            // Reveal and select two cards with the same imageId
            state = {
                ...state,
                cards: state.cards.map(card =>
                    [1, 2].includes(card.id)
                        ? { ...card, isRevealed: true }
                        : card
                ),
                selectedCardIds: [1, 2] // Cards 1 and 2 have the same imageId (1)
            };

            const newState = updateGameState(state);

            // Cards should be marked as matched
            const card1 = newState.cards.find(card => card.id === 1);
            const card2 = newState.cards.find(card => card.id === 2);
            expect(card1?.isMatched).toBe(true);
            expect(card2?.isMatched).toBe(true);

            // Selected cards should be cleared after a match
            expect(newState.selectedCardIds).toEqual([]);
        });

        it('should hide cards and clear selection when they do not match', () => {
            let state = createTestGameState();

            // Reveal and select two cards with different imageIds
            state = {
                ...state,
                cards: state.cards.map(card =>
                    [1, 3].includes(card.id)
                        ? { ...card, isRevealed: true }
                        : card
                ),
                selectedCardIds: [1, 3] // Card 1 has imageId 1, Card 3 has imageId 2
            };

            const newState = updateGameState(state);

            // Cards should not be matched
            const card1 = newState.cards.find(card => card.id === 1);
            const card3 = newState.cards.find(card => card.id === 3);
            expect(card1?.isMatched).toBe(false);
            expect(card3?.isMatched).toBe(false);

            // Cards should be hidden again
            expect(card1?.isRevealed).toBe(false);
            expect(card3?.isRevealed).toBe(false);

            // Selected cards should be cleared
            expect(newState.selectedCardIds).toEqual([]);
        });

        it('should mark the game as VICTORY_MUSIC when all cards are matched', () => {
            let state = createTestGameState();

            // Mark all but 2 cards as matched
            state = {
                ...state,
                cards: state.cards.map(card => {
                    if ([1, 2].includes(card.id)) {
                        // Cards 1 and 2 are revealed but not yet matched
                        return { ...card, isRevealed: true };
                    } else {
                        // All other cards are already matched
                        return { ...card, isMatched: true, isRevealed: true };
                    }
                }),
                selectedCardIds: [1, 2] // Cards 1 and 2 have the same imageId (1)
            };

            const newState = updateGameState(state);

            // All cards should be matched now
            expect(newState.cards.every(card => card.isMatched)).toBe(true);

            // Game status should be VICTORY_MUSIC
            expect(newState.status).toBe(GameStatus.VICTORY_MUSIC);
        });

        it('should not update the state when fewer than 2 cards are selected', () => {
            let state = createTestGameState();

            // Reveal and select just one card
            state = {
                ...state,
                cards: state.cards.map(card =>
                    card.id === 1
                        ? { ...card, isRevealed: true }
                        : card
                ),
                selectedCardIds: [1]
            };

            const stateBeforeUpdate = { ...state };
            const newState = updateGameState(state);

            // State should remain unchanged
            expect(newState).toEqual(stateBeforeUpdate);
        });
    });

    describe('resetGameState', () => {
        it('should reset the game state to a new game', () => {
            let state = createTestGameState();

            // Make some changes to the state
            state = {
                ...state,
                cards: state.cards.map(card =>
                    [1, 2].includes(card.id)
                        ? { ...card, isMatched: true, isRevealed: true }
                        : card
                ),
                moves: 5,
                status: GameStatus.VICTORY_MUSIC,
                selectedCardIds: [3, 4]
            };

            const newState = resetGameState(state);

            // Check that the game is reset
            expect(newState.status).toBe(GameStatus.READY);
            expect(newState.moves).toBe(0);
            expect(newState.selectedCardIds).toEqual([]);

            // All cards should be reset (not matched, not revealed)
            newState.cards.forEach(card => {
                expect(card.isMatched).toBe(false);
                expect(card.isRevealed).toBe(false);
            });

            // The number of cards should be the same
            expect(newState.cards.length).toBe(state.cards.length);
        });

        it('should use the provided shuffle function', () => {
            const state = createTestGameState();

            // Simple mock shuffle function that reverses the array
            const mockShuffleFunction = (cards: Card[]): Card[] => {
                return [...cards].reverse();
            };

            // Get original card order by ID
            const originalOrderIds = state.cards.map(card => card.id);

            // Reset with the mock shuffle function
            const newState = resetGameState(state, mockShuffleFunction);

            // Get new card order by ID
            const newOrderIds = newState.cards.map(card => card.id);

            // The new order should be the reverse of the original
            expect(newOrderIds).toEqual([...originalOrderIds].reverse());
        });
    });
}); 