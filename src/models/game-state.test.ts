import { describe, it, expect } from 'vitest';
import {
    GameStatus,
    Card,
    createInitialGameState,
    createCards,
    initializeGame,
    revealCard,
    checkForMatches,
    hideUnmatchedCards,
    resetGame
} from './game-state';

describe('Game State Model', () => {
    // Test data
    const mockShuffleFunction = (cards: Card[]): Card[] => {
        // Simple mock shuffle function that reverses the array
        return [...cards].reverse();
    };

    describe('createInitialGameState', () => {
        it('should create a game state with default values', () => {
            const state = createInitialGameState();
            expect(state.cards).toEqual([]);
            expect(state.status).toBe(GameStatus.IN_PROGRESS);
            expect(state.moves).toBe(0);
            expect(state.selectedCardIds).toEqual([]);
        });
    });

    describe('createCards', () => {
        it('should create the correct number of card pairs', () => {
            const cards = createCards(3);
            expect(cards.length).toBe(6); // 3 pairs = 6 cards

            // Check if we have the expected image IDs
            const imageIds = cards.map(card => card.imageId);
            expect(imageIds.sort()).toEqual([1, 1, 2, 2, 3, 3]);
        });

        it('should initialize cards with proper properties', () => {
            const cards = createCards(1);
            expect(cards.length).toBe(2);

            cards.forEach(card => {
                expect(card).toHaveProperty('id');
                expect(card).toHaveProperty('imageId');
                expect(card.isMatched).toBe(false);
                expect(card.isRevealed).toBe(false);
            });

            // Check for paired IDs
            expect(cards[0].imageId).toBe(cards[1].imageId);
            expect(cards[0].id).not.toBe(cards[1].id);
        });
    });

    describe('initializeGame', () => {
        it('should initialize a game with the correct number of cards', () => {
            const state = initializeGame(4);
            expect(state.cards.length).toBe(8); // 4 pairs = 8 cards
            expect(state.status).toBe(GameStatus.IN_PROGRESS);
            expect(state.moves).toBe(0);
            expect(state.selectedCardIds).toEqual([]);
        });

        it('should use the provided shuffle function', () => {
            // Create cards and get their original order
            const originalCards = createCards(2);

            // Initialize game with our mock shuffle function
            const state = initializeGame(2, mockShuffleFunction);

            // Verify the cards are in reverse order (as per our mock shuffle)
            expect(state.cards[0].id).toBe(originalCards[originalCards.length - 1].id);
            expect(state.cards[state.cards.length - 1].id).toBe(originalCards[0].id);
        });
    });

    describe('revealCard', () => {
        it('should reveal an unrevealed card', () => {
            let state = initializeGame(2);
            const cardToReveal = state.cards[0];

            state = revealCard(state, cardToReveal.id);

            // Check if the card is revealed
            const updatedCard = state.cards.find(card => card.id === cardToReveal.id);
            expect(updatedCard?.isRevealed).toBe(true);

            // Check if the card ID is added to selectedCardIds
            expect(state.selectedCardIds).toContain(cardToReveal.id);
        });

        it('should not reveal an already revealed card', () => {
            let state = initializeGame(2);
            const cardToReveal = state.cards[0];

            // Reveal the card first
            state = revealCard(state, cardToReveal.id);
            const selectedCardIdsAfterFirstReveal = [...state.selectedCardIds];

            // Try to reveal the same card again
            state = revealCard(state, cardToReveal.id);

            // Selected card IDs should not change
            expect(state.selectedCardIds).toEqual(selectedCardIdsAfterFirstReveal);
        });

        it('should not reveal a matched card', () => {
            let state = initializeGame(2);

            // Find a pair of cards with the same imageId
            const card1 = state.cards[0];
            const card2 = state.cards.find(card =>
                card.id !== card1.id && card.imageId === card1.imageId
            );

            if (!card2) {
                throw new Error('Test setup failed: Matching card not found');
            }

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches to mark them as matched
            state = checkForMatches(state);

            // Try to reveal one of the matched cards again
            const stateBeforeReveal = { ...state };
            state = revealCard(state, card1.id);

            // State should not change
            expect(state).toEqual(stateBeforeReveal);
        });

        it('should increment moves when revealing the second card', () => {
            let state = initializeGame(2);

            // Reveal first card
            state = revealCard(state, state.cards[0].id);
            expect(state.moves).toBe(0);

            // Reveal second card
            state = revealCard(state, state.cards[1].id);
            expect(state.moves).toBe(1);
        });

        it('should not allow revealing more than 2 cards', () => {
            let state = initializeGame(3);

            // Reveal first two cards
            state = revealCard(state, state.cards[0].id);
            state = revealCard(state, state.cards[1].id);

            // Try to reveal a third card
            const stateBeforeThirdReveal = { ...state };
            state = revealCard(state, state.cards[2].id);

            // State should not change
            expect(state).toEqual(stateBeforeThirdReveal);
        });
    });

    describe('checkForMatches', () => {
        it('should mark cards as matched when they have the same imageId', () => {
            let state = initializeGame(2);

            // Find a pair of cards with the same imageId
            const card1 = state.cards[0];
            const card2 = state.cards.find(card =>
                card.id !== card1.id && card.imageId === card1.imageId
            );

            if (!card2) {
                throw new Error('Test setup failed: Matching card not found');
            }

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches
            state = checkForMatches(state);

            // Both cards should be marked as matched
            const updatedCard1 = state.cards.find(card => card.id === card1.id);
            const updatedCard2 = state.cards.find(card => card.id === card2.id);

            expect(updatedCard1?.isMatched).toBe(true);
            expect(updatedCard2?.isMatched).toBe(true);

            // Selected card IDs should be cleared
            expect(state.selectedCardIds).toEqual([]);
        });

        it('should not mark cards as matched when they have different imageIds', () => {
            let state = initializeGame(2);

            // Find two cards with different imageIds
            const card1 = state.cards[0];
            const card2 = state.cards.find(card =>
                card.id !== card1.id && card.imageId !== card1.imageId
            );

            if (!card2) {
                throw new Error('Test setup failed: Non-matching card not found');
            }

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches
            state = checkForMatches(state);

            // Cards should not be marked as matched
            const updatedCard1 = state.cards.find(card => card.id === card1.id);
            const updatedCard2 = state.cards.find(card => card.id === card2.id);

            expect(updatedCard1?.isMatched).toBe(false);
            expect(updatedCard2?.isMatched).toBe(false);

            // Selected card IDs should not be cleared
            expect(state.selectedCardIds).toContain(card1.id);
            expect(state.selectedCardIds).toContain(card2.id);
        });

        it('should update game status to COMPLETED when all cards are matched', () => {
            let state = initializeGame(1); // Just one pair for simplicity

            // Find the pair of cards
            const card1 = state.cards[0];
            const card2 = state.cards[1];

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches
            state = checkForMatches(state);

            // Game status should be COMPLETED
            expect(state.status).toBe(GameStatus.COMPLETED);
        });

        it('should not change anything if less than 2 cards are selected', () => {
            let state = initializeGame(2);

            // Reveal just one card
            state = revealCard(state, state.cards[0].id);

            // Store state before check
            const stateBeforeCheck = { ...state };

            // Check for matches
            state = checkForMatches(state);

            // State should not change
            expect(state).toEqual(stateBeforeCheck);
        });
    });

    describe('hideUnmatchedCards', () => {
        it('should hide revealed unmatched cards', () => {
            let state = initializeGame(2);

            // Find two cards with different imageIds
            const card1 = state.cards[0];
            const card2 = state.cards.find(card =>
                card.id !== card1.id && card.imageId !== card1.imageId
            );

            if (!card2) {
                throw new Error('Test setup failed: Non-matching card not found');
            }

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches (they won't match)
            state = checkForMatches(state);

            // Hide unmatched cards
            state = hideUnmatchedCards(state);

            // Both cards should be hidden
            const updatedCard1 = state.cards.find(card => card.id === card1.id);
            const updatedCard2 = state.cards.find(card => card.id === card2.id);

            expect(updatedCard1?.isRevealed).toBe(false);
            expect(updatedCard2?.isRevealed).toBe(false);

            // Selected card IDs should be cleared
            expect(state.selectedCardIds).toEqual([]);
        });

        it('should not hide matched cards', () => {
            let state = initializeGame(2);

            // Find a pair of cards with the same imageId
            const card1 = state.cards[0];
            const card2 = state.cards.find(card =>
                card.id !== card1.id && card.imageId === card1.imageId
            );

            if (!card2) {
                throw new Error('Test setup failed: Matching card not found');
            }

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches (they will match)
            state = checkForMatches(state);

            // Hide unmatched cards - shouldn't affect matched cards
            state = hideUnmatchedCards(state);

            // Both cards should still be revealed because they're matched
            const updatedCard1 = state.cards.find(card => card.id === card1.id);
            const updatedCard2 = state.cards.find(card => card.id === card2.id);

            expect(updatedCard1?.isRevealed).toBe(true);
            expect(updatedCard2?.isRevealed).toBe(true);
        });
    });

    describe('resetGame', () => {
        it('should reset the game to initial state', () => {
            // Create a game and make some moves
            let state = initializeGame(2);

            // Reveal some cards and make a match
            const card1 = state.cards[0];
            const card2 = state.cards.find(card =>
                card.id !== card1.id && card.imageId === card1.imageId
            );

            if (!card2) {
                throw new Error('Test setup failed: Matching card not found');
            }

            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);
            state = checkForMatches(state);

            // Reset the game
            state = resetGame(state);

            // Check that game is reset
            expect(state.status).toBe(GameStatus.IN_PROGRESS);
            expect(state.moves).toBe(0);
            expect(state.selectedCardIds).toEqual([]);

            // All cards should be unrevealed and unmatched
            state.cards.forEach(card => {
                expect(card.isRevealed).toBe(false);
                expect(card.isMatched).toBe(false);
            });
        });

        it('should use the provided shuffle function', () => {
            // Create initial game
            let state = initializeGame(2);

            // Get the card order
            const originalCardIds = state.cards.map(card => card.id);

            // Reset game with our mock shuffle function
            state = resetGame(state, mockShuffleFunction);

            // Get the new card order
            const newCardIds = state.cards.map(card => card.id);

            // Cards should be in reverse order
            expect(newCardIds[0]).toBe(originalCardIds[originalCardIds.length - 1]);
            expect(newCardIds[newCardIds.length - 1]).toBe(originalCardIds[0]);
        });
    });
}); 