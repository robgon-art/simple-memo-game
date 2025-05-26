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
import { CardImage, imageManager } from '../managers/image-manager';

describe('Game State Model', () => {
    describe('createInitialGameState', () => {
        it('should create a game state with default values', () => {
            const state = createInitialGameState();
            expect(state.cards).toEqual([]);
            expect(state.status).toBe(GameStatus.READY);
            expect(state.moves).toBe(0);
            expect(state.selectedCardIds).toEqual([]);
        });
    });

    describe('createCards', () => {
        it('should create the correct number of card pairs', () => {
            const testImages: CardImage[] = [
                { id: 1, name: 'Test 1', path: '/test1.jpg' },
                { id: 2, name: 'Test 2', path: '/test2.jpg' },
                { id: 3, name: 'Test 3', path: '/test3.jpg' }
            ];
            const cards = createCards(testImages);
            expect(cards.length).toBe(6); // 3 pairs = 6 cards
        });

        it('should initialize cards with proper properties', () => {
            const testImages: CardImage[] = [
                { id: 1, name: 'Test 1', path: '/test1.jpg' }
            ];
            const cards = createCards(testImages);
            expect(cards[0]).toEqual({
                id: 1,
                imageId: 1,
                isRevealed: false,
                isMatched: false
            });
            expect(cards[1]).toEqual({
                id: 2,
                imageId: 1,
                isRevealed: false,
                isMatched: false
            });
        });
    });

    describe('initializeGame', () => {
        it('should initialize a game with the correct number of cards', () => {
            const state = initializeGame(3);
            expect(state.cards.length).toBe(6); // 3 pairs = 6 cards
            expect(state.status).toBe(GameStatus.READY);
            expect(state.moves).toBe(0);
            expect(state.selectedCardIds).toEqual([]);
        });

        it('should use the provided shuffle function', () => {
            // Create a mock shuffle function that reverses the array
            const shuffleFunction = (cards: Card[]) => [...cards].reverse();

            // Create test images directly instead of using random selection
            const testImages: CardImage[] = [
                { id: 1, name: 'Test 1', path: '/test1.jpg' },
                { id: 2, name: 'Test 2', path: '/test2.jpg' },
                { id: 3, name: 'Test 3', path: '/test3.jpg' }
            ];

            // Create original cards from test images
            const originalCards = createCards(testImages);

            // Mock the getRandomCardImages method to return our test images
            const originalGetRandomCardImages = imageManager.getRandomCardImages;
            imageManager.getRandomCardImages = () => testImages;

            try {
                // Initialize game with our shuffle function
                const state = initializeGame(3, shuffleFunction);

                // The cards should be in reverse order
                expect(state.cards).toEqual(originalCards.reverse());
            } finally {
                // Restore the original method
                imageManager.getRandomCardImages = originalGetRandomCardImages;
            }
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

        it('should update game status to VICTORY_MUSIC when all cards are matched', () => {
            let state = initializeGame(1); // Just one pair for simplicity

            // Find the pair of cards
            const card1 = state.cards[0];
            const card2 = state.cards[1];

            // Reveal both cards
            state = revealCard(state, card1.id);
            state = revealCard(state, card2.id);

            // Check for matches
            state = checkForMatches(state);

            // Game status should be VICTORY_MUSIC
            expect(state.status).toBe(GameStatus.VICTORY_MUSIC);
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
            expect(state.status).toBe(GameStatus.READY);
            expect(state.moves).toBe(0);
            expect(state.selectedCardIds).toEqual([]);

            // All cards should be unrevealed and unmatched
            state.cards.forEach(card => {
                expect(card.isRevealed).toBe(false);
                expect(card.isMatched).toBe(false);
            });
        });

        it('should use the provided shuffle function', () => {
            // Create a mock shuffle function that reverses the array
            const shuffleFunction = (cards: Card[]) => [...cards].reverse();

            // Create test images directly instead of using random selection
            const testImages: CardImage[] = [
                { id: 1, name: 'Test 1', path: '/test1.jpg' },
                { id: 2, name: 'Test 2', path: '/test2.jpg' },
                { id: 3, name: 'Test 3', path: '/test3.jpg' }
            ];

            // Create original cards from test images
            const originalCards = createCards(testImages);

            // Mock the getRandomCardImages method to return our test images
            const originalGetRandomCardImages = imageManager.getRandomCardImages;
            imageManager.getRandomCardImages = () => testImages;

            try {
                // Initialize game with our shuffle function
                const state = initializeGame(3, shuffleFunction);

                // The cards should be in reverse order
                expect(state.cards).toEqual(originalCards.reverse());
            } finally {
                // Restore the original method
                imageManager.getRandomCardImages = originalGetRandomCardImages;
            }
        });
    });
}); 