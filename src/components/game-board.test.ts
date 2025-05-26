import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { GameBoard } from './game-board';
import '../components/game-board';
import { GameStatus, initializeGameWithProgress } from '../models/game-state';
import { seededShuffleCards } from '../functions/shuffle';
import { SynchronousTimerService, TimerService } from '../services/timer-service';
import { AudioManager } from '../managers/audio-manager';

describe('GameBoard Component', () => {
    let element: GameBoard;
    // Mock audio manager for testing
    const mockPlayEffect = vi.fn().mockReturnValue(true);
    const mockPlayMusic = vi.fn().mockReturnValue(true);
    const mockStopMusic = vi.fn();
    const mockAudioManager = {
        playEffect: mockPlayEffect,
        playMusic: mockPlayMusic,
        stopMusic: mockStopMusic,
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
        element.initializeGameState = () => initializeGameWithProgress(12, null, (cards) => seededShuffleCards(cards, 42));
        element.gameState = element.initializeGameState();
    });

    it('should initialize with a valid game state', () => {
        expect(element.gameState).toBeDefined();
        expect(element.gameState.cards.length).toBe(24);
        expect(element.gameState.status).toBe(GameStatus.READY);
        expect(element.gameState.moves).toBe(0);
        expect(element.gameState.selectedCardIds).toEqual([]);
        expect(element.gameState.isPreviewMode).toBe(false);
        expect(element.gameState.cardStyle).toBe('impressionist');
        expect(element.gameState.gridSize).toBe('easy');
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
            status: GameStatus.VICTORY_MUSIC
        };

        // Update the game state
        element.gameState = allMatched;

        // Call checkForMatches to trigger the game completion handler
        element.checkForMatches();

        // Check that game completion callback was called
        expect(completionSpy).toHaveBeenCalledWith(allMatched.moves);
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

        // Reset the mock to verify the flip back sound
        mockPlayEffect.mockClear();

        // Click third card while two unmatched cards are revealed
        element.handleCardFlip(new CustomEvent('card-flipped'), thirdCard.id);

        // Verify clearTimeout was called
        expect(mockTimerService.clearTimeout).toHaveBeenCalledWith(123);

        // Verify flip sound was played twice (once for cards flipping back, once for new card)
        expect(mockPlayEffect).toHaveBeenCalledTimes(2);
        expect(mockPlayEffect).toHaveBeenCalledWith('cardFlip');
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
            ),
            status: GameStatus.READY
        };

        // @ts-ignore - accessing private field for testing
        element.matchCheckTimer = 123;

        // Try to click the already revealed card
        const initialState = JSON.stringify(element.gameState);
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);

        // State should not change because the card was already revealed
        expect(JSON.stringify(element.gameState)).toBe(initialState);
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

        // Configure a special mock for this test that doesn't play sounds when cards are flipped back
        const specialTimerService: TimerService = {
            setTimeout: vi.fn().mockReturnValue(999),
            clearTimeout: vi.fn()
        };
        element.timerService = specialTimerService;

        // Select both cards
        element.handleCardFlip(new CustomEvent('card-flipped'), firstCard.id);

        // Reset the mock to verify only the card flip sound for second card
        mockPlayEffect.mockClear();

        // Select the second card which should not match
        element.handleCardFlip(new CustomEvent('card-flipped'), secondCard.id);

        // Should only call playEffect once for the card flip sound
        expect(mockPlayEffect).toHaveBeenCalledWith('cardFlip');
        expect(mockPlayEffect).not.toHaveBeenCalledWith('match');
    });

    it('should play a sound when cards flip back automatically', () => {
        // Use a normal timer service with a mock
        const mockTimerService: TimerService = {
            setTimeout: vi.fn((callback) => {
                // Immediately execute the callback
                callback();
                return 789;
            }),
            clearTimeout: vi.fn()
        };
        element.timerService = mockTimerService;

        // Find two cards with different imageIds
        const cards = element.gameState.cards;
        const firstCard = cards[0];
        const secondCard = cards.find(card =>
            card.imageId !== firstCard.imageId
        )!;

        // Set up the state with two selected non-matching cards
        element.gameState = {
            ...element.gameState,
            selectedCardIds: [firstCard.id, secondCard.id],
            cards: element.gameState.cards.map(card =>
                (card.id === firstCard.id || card.id === secondCard.id)
                    ? { ...card, isRevealed: true, isMatched: false }
                    : card
            )
        };

        // Reset the mock to verify only the flip back sound
        mockPlayEffect.mockClear();

        // Call checkForMatches which will set the timer and immediately run the callback
        element.checkForMatches();

        // Verify the card flip sound was played for cards flipping back
        expect(mockPlayEffect).toHaveBeenCalledWith('cardFlip');
    });

    describe('URL progress parameter functionality', () => {
        // Store the original URLSearchParams to restore after tests
        const originalURLSearchParams = window.URLSearchParams;
        let mockURLParams: URLSearchParams;

        beforeEach(() => {
            // Reset the game state before each test
            element.gameState = element.initializeGameState();

            // Mock URLSearchParams for testing
            mockURLParams = new URLSearchParams();

            // Mock the global URLSearchParams class
            global.URLSearchParams = vi.fn().mockImplementation(() => mockURLParams);
        });

        afterEach(() => {
            // Restore the original URLSearchParams
            global.URLSearchParams = originalURLSearchParams;
        });

        it('should initialize game normally when no progress parameter is present', () => {
            // Create a custom initializeGameState method that doesn't use the mock shuffle
            const customInitMethod = () => {
                return GameBoard.prototype.initializeGameState.call(element);
            };

            // Call the method
            const gameState = customInitMethod();

            // Verify normal initialization
            expect(gameState.moves).toBe(0);
            expect(gameState.status).toBe(GameStatus.READY);
            expect(gameState.cards.every(card => !card.isMatched && !card.isRevealed)).toBe(true);
            expect(gameState.isPreviewMode).toBe(false);
            expect(gameState.cardStyle).toBe('impressionist');
            expect(gameState.gridSize).toBe('easy');
        });

        it('should pre-match the specified number of pairs when valid progress parameter is present', () => {
            // Set up the URL parameter
            mockURLParams.set('progress', '5');

            // Create a custom initializeGameState method that doesn't use the mock shuffle
            const customInitMethod = () => {
                return GameBoard.prototype.initializeGameState.call(element);
            };

            // Call the method
            const gameState = customInitMethod();

            // Count the number of matched pairs
            const matchedCards = gameState.cards.filter(card => card.isMatched && card.isRevealed);
            const matchedPairs = matchedCards.length / 2;

            // Verify the expected number of pairs are matched
            expect(matchedPairs).toBe(5);
            expect(gameState.moves).toBe(5); // Moves should match the number of matched pairs
            expect(gameState.status).toBe(GameStatus.VICTORY_MUSIC);
            expect(gameState.isPreviewMode).toBe(false);
            expect(gameState.cardStyle).toBe('impressionist');
            expect(gameState.gridSize).toBe('easy');

            // Verify that the matched cards form valid pairs
            const matchedImageIds = new Set(matchedCards.map(card => card.imageId));
            expect(matchedImageIds.size).toBe(5); // Should have 5 unique imageIds

            // Each imageId should appear exactly twice in the matched cards
            matchedImageIds.forEach(imageId => {
                const cardsWithThisImageId = matchedCards.filter(card => card.imageId === imageId);
                expect(cardsWithThisImageId.length).toBe(2);
            });
        });

        it('should handle invalid progress parameter values', () => {
            // Test with non-numeric value
            mockURLParams.set('progress', 'invalid');

            let gameState = GameBoard.prototype.initializeGameState.call(element);
            expect(gameState.cards.every(card => !card.isMatched && !card.isRevealed)).toBe(true);
            expect(gameState.moves).toBe(0);
            expect(gameState.isPreviewMode).toBe(false);
            expect(gameState.cardStyle).toBe('impressionist');
            expect(gameState.gridSize).toBe('easy');

            // Test with negative value
            mockURLParams.set('progress', '-5');

            gameState = GameBoard.prototype.initializeGameState.call(element);
            expect(gameState.cards.every(card => !card.isMatched && !card.isRevealed)).toBe(true);
            expect(gameState.moves).toBe(0);
            expect(gameState.isPreviewMode).toBe(false);
            expect(gameState.cardStyle).toBe('impressionist');
            expect(gameState.gridSize).toBe('easy');

            // Test with value greater than total pairs
            mockURLParams.set('progress', '20');

            gameState = GameBoard.prototype.initializeGameState.call(element);
            expect(gameState.cards.every(card => !card.isMatched && !card.isRevealed)).toBe(true);
            expect(gameState.moves).toBe(0);
            expect(gameState.isPreviewMode).toBe(false);
            expect(gameState.cardStyle).toBe('impressionist');
            expect(gameState.gridSize).toBe('easy');
        });
    });
}); 