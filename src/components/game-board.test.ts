import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { GameBoard } from './game-board';
import '../components/game-board';
import { GameStatus, initializeGame } from '../models/game-state';
import { seededShuffleCards } from '../functions/shuffle';
import { SynchronousTimerService, TimerService } from '../services/timer-service';
import { AudioManager } from '../managers/audio-manager';

describe('GameBoard Component', () => {
    let element: GameBoard;
    // Mock audio manager for testing
    const mockPlayEffect = vi.fn().mockReturnValue(true);
    const mockAudioManager = {
        playEffect: mockPlayEffect,
        getAllAudioEffects: vi.fn().mockReturnValue([
            { id: 'cardFlip', path: '/Card Flip.wav' },
            { id: 'match', path: '/Match Sound.wav' }
        ]),
        getAudioEffectById: vi.fn(),
        setSilent: vi.fn(),
        reset: vi.fn(),
        initialize: vi.fn()
    } as unknown as AudioManager;

    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();

        // Use the component's actual registered name
        element = await fixture(html`<memory-game-board></memory-game-board>`);

        // Use the synchronous timer service for testing
        element.timerService = new SynchronousTimerService();

        // Use the mock audio manager
        element.audioManager = mockAudioManager;

        // Use a seeded shuffle for consistent test results
        element.initializeGameState = () => initializeGame(12, (cards) => seededShuffleCards(cards, 42));
        element.gameState = element.initializeGameState();
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

        // With our synchronous timer service, the callback executes immediately
        // so the cards should already be flipped back

        // Cards should now be flipped back (not revealed)
        expect(element.gameState.cards.find(card => card.id === firstCard.id)?.isRevealed).toBe(false);
        expect(element.gameState.cards.find(card => card.id === secondCard.id)?.isRevealed).toBe(false);

        // Selected cards should be cleared
        expect(element.gameState.selectedCardIds).toEqual([]);
    });

    it('should detect game completion when all cards are matched', async () => {
        // Create a spy for the onGameCompleted callback
        const completionSpy = vi.fn();
        element.onGameCompleted = completionSpy;

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

        // Check that game completion callback was called
        expect(completionSpy).toHaveBeenCalledWith(allMatched.moves);
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

    it('should clear existing timer when clicking another card while two unmatched cards are revealed', () => {
        // Create a spy for the timerService.clearTimeout method
        const mockTimerService: TimerService = {
            setTimeout: vi.fn().mockReturnValue(123),
            clearTimeout: vi.fn()
        };
        element.timerService = mockTimerService;

        // Find three cards with different imageIds
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card => card.imageId !== firstCard.imageId)!;
        const thirdCard = cards.find(card =>
            card.id !== firstCard.id &&
            card.id !== secondCard.id &&
            card.imageId !== firstCard.imageId
        )!;

        // Select first and second card (which don't match)
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCard.id);

        // Set a fake timer (normally done by checkForMatches)
        // @ts-ignore - accessing private field for testing
        element.matchCheckTimer = 123;

        // Manually set cards to be revealed but not matched
        element.gameState = {
            ...element.gameState,
            selectedCardIds: [firstCard.id, secondCard.id],
            cards: element.gameState.cards.map(card =>
                (card.id === firstCard.id || card.id === secondCard.id)
                    ? { ...card, isRevealed: true, isMatched: false }
                    : card
            )
        };

        // Click third card while two unmatched cards are revealed
        element.handleCardFlip(new CustomEvent('card-flipped'), thirdCard.id);

        // Verify clearTimeout was called
        expect(mockTimerService.clearTimeout).toHaveBeenCalledWith(123);
    });

    it('should ignore clicks on already revealed cards', () => {
        // Create a spy for the functions we need to test
        const mockTimerService: TimerService = {
            setTimeout: vi.fn().mockReturnValue(123),
            clearTimeout: vi.fn()
        };
        element.timerService = mockTimerService;

        // Find a card to use in the test
        const cards = element.gameState.cards;
        const firstCard = cards[0];

        // Manually set up the state with one revealed card
        element.gameState = {
            ...element.gameState,
            selectedCardIds: [firstCard.id],
            cards: element.gameState.cards.map(card =>
                card.id === firstCard.id
                    ? { ...card, isRevealed: true }
                    : card
            )
        };

        // @ts-ignore - accessing private field for testing
        element.matchCheckTimer = 123;

        // Try to click the already revealed card
        const initialState = JSON.stringify(element.gameState);
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);

        // State should not change because the card was already revealed
        expect(JSON.stringify(element.gameState)).toBe(initialState);

        // Timer should not be cleared since condition in handleCardFlip 
        // should never be triggered for an already revealed card
        expect(mockTimerService.clearTimeout).not.toHaveBeenCalled();
    });

    it('should clear existing timer in checkForMatches if there is one', () => {
        // Create a spy for the timerService methods
        const mockTimerService: TimerService = {
            setTimeout: vi.fn().mockReturnValue(456),
            clearTimeout: vi.fn()
        };
        element.timerService = mockTimerService;

        // Set up initial state with two selected cards
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card => card.imageId !== firstCard.imageId)!;

        element.gameState = {
            ...element.gameState,
            selectedCardIds: [firstCard.id, secondCard.id],
            cards: element.gameState.cards.map(card =>
                (card.id === firstCard.id || card.id === secondCard.id)
                    ? { ...card, isRevealed: true }
                    : card
            )
        };

        // Set a fake timer
        // @ts-ignore - accessing private field for testing
        element.matchCheckTimer = 456;

        // Call checkForMatches
        element.checkForMatches();

        // Should clear the existing timer
        expect(mockTimerService.clearTimeout).toHaveBeenCalledWith(456);
    });

    // AUDIO TESTS

    it('should play the cardFlip sound when a card is flipped', async () => {
        // Simulate a card flip event
        const cardId = element.gameState.cards[0].id;
        element.handleCardFlip(new CustomEvent('card-flipped'), cardId);

        // Check that playEffect was called with 'cardFlip'
        expect(mockPlayEffect).toHaveBeenCalledWith('cardFlip');
    });

    it('should play the match sound when two cards match', async () => {
        // Find two cards with the same imageId
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card =>
            card.id !== firstCard.id && card.imageId === firstCard.imageId
        )!;

        // Select both cards
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);

        // Reset the mock to verify only the match sound
        mockPlayEffect.mockClear();

        // Select the second card which should match
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCard.id);

        // Check that playEffect was called with 'match'
        expect(mockPlayEffect).toHaveBeenCalledWith('match');
    });

    it('should not play the match sound when two cards do not match', async () => {
        // Find two cards with different imageIds
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card =>
            card.imageId !== firstCard.imageId
        )!;

        // Select both cards
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);

        // Reset the mock to verify only the card flip sound for second card
        mockPlayEffect.mockClear();

        // Select the second card which should not match
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCard.id);

        // Should only call playEffect once for the card flip sound
        expect(mockPlayEffect).toHaveBeenCalledTimes(1);
        expect(mockPlayEffect).toHaveBeenCalledWith('cardFlip');
        expect(mockPlayEffect).not.toHaveBeenCalledWith('match');
    });
}); 