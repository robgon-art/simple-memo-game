import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { GameBoard } from './game-board';
import '../components/game-board';
import { GameStatus, initializeGame } from '../models/game-state';
import { seededShuffleCards } from '../functions/shuffle';

// Register custom elements
customElements.define('test-memory-game-board', GameBoard);

describe('GameBoard Component', () => {
    let element: GameBoard;

    // For type safety with the mocks
    type TimeoutId = ReturnType<typeof setTimeout>;

    beforeEach(async () => {
        // Create a new instance of the component before each test
        element = await fixture(html`<test-memory-game-board></test-memory-game-board>`);

        // Mock setTimeout
        vi.spyOn(window, 'setTimeout').mockImplementation((callback: TimerHandler, _?: number) => {
            // Execute callback immediately for testing
            if (typeof callback === 'function') {
                callback();
            } else if (typeof callback === 'string') {
                eval(callback);
            }
            return 1 as unknown as TimeoutId; // Dummy ID
        });

        // Mock clearTimeout
        vi.spyOn(window, 'clearTimeout').mockImplementation(() => {
            // Do nothing in tests
        });

        // Use a seeded shuffle for consistent test results
        element.initializeGameState = () => initializeGame(12, (cards) => seededShuffleCards(cards, 42));
        element.gameState = element.initializeGameState();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with a valid game state', () => {
        expect(element.gameState).toBeDefined();
        expect(element.gameState.cards.length).toBe(24);
        expect(element.gameState.status).toBe(GameStatus.IN_PROGRESS);
        expect(element.gameState.moves).toBe(0);
        expect(element.gameState.selectedCardIds).toEqual([]);
    });

    it('should reveal a card when clicked', async () => {
        const cards = element.shadowRoot!.querySelectorAll('flip-card');
        expect(cards.length).toBe(24);

        // Simulate a card flip event
        const cardId = element.gameState.cards[0].id;
        element.handleCardFlip(new CustomEvent('card-flipped'), cardId);

        // Card should now be revealed in the game state
        expect(element.gameState.cards.find(card => card.id === cardId)?.isRevealed).toBe(true);
        expect(element.gameState.selectedCardIds).toContain(cardId);
    });

    it('should increment moves counter when two cards are selected', async () => {
        const firstCardId = element.gameState.cards[0].id;
        const secondCardId = element.gameState.cards[1].id;

        // Select first card
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCardId);
        expect(element.gameState.moves).toBe(0);

        // Select second card
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCardId);
        expect(element.gameState.moves).toBe(1);
    });

    it('should mark cards as matched when they have the same imageId', async () => {
        // Find two cards with the same imageId
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card =>
            card.id !== firstCard.id && card.imageId === firstCard.imageId
        )!;

        // Select both cards
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCard.id);

        // Both cards should now be matched
        expect(element.gameState.cards.find(card => card.id === firstCard.id)?.isMatched).toBe(true);
        expect(element.gameState.cards.find(card => card.id === secondCard.id)?.isMatched).toBe(true);

        // Selected cards should be cleared after a match
        expect(element.gameState.selectedCardIds).toEqual([]);
    });

    it('should flip cards back after delay when they do not match', async () => {
        // Find two cards with different imageIds
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card =>
            card.imageId !== firstCard.imageId
        )!;

        // Select both cards
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCard.id);

        // With our mock implementation, setTimeout executes immediately
        // so the cards should already be flipped back

        // Cards should now be flipped back (not revealed)
        expect(element.gameState.cards.find(card => card.id === firstCard.id)?.isRevealed).toBe(false);
        expect(element.gameState.cards.find(card => card.id === secondCard.id)?.isRevealed).toBe(false);

        // Selected cards should be cleared
        expect(element.gameState.selectedCardIds).toEqual([]);
    });

    it('should detect game completion when all cards are matched', async () => {
        // Mock console.log to verify game completion message
        const consoleLogSpy = vi.spyOn(console, 'log');

        // Manually set all cards to matched state
        const allMatched = {
            ...element.gameState,
            cards: element.gameState.cards.map(card => ({ ...card, isMatched: true })),
            status: GameStatus.COMPLETED
        };

        // Update the game state
        element.gameState = allMatched;

        // Call checkForMatches to trigger the game completion handler
        element.checkForMatches();

        // Check that game completion was detected and logged
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Game completed'));
    });

    it('should restart the game when restart button is clicked', async () => {
        // First, modify the game state to have some progress
        const inProgressState = {
            ...element.gameState,
            moves: 5,
            cards: element.gameState.cards.map((card, index) =>
                index < 4 ? { ...card, isMatched: true, isRevealed: true } : card
            )
        };

        element.gameState = inProgressState;

        // Call restart
        element.restartGame();

        // Game should be reset
        expect(element.gameState.moves).toBe(0);
        expect(element.gameState.selectedCardIds).toEqual([]);
        expect(element.gameState.status).toBe(GameStatus.IN_PROGRESS);
        expect(element.gameState.cards.every(card => !card.isMatched && !card.isRevealed)).toBe(true);
    });
}); 