/**
 * Memory Game State Model
 * 
 * Implements game state using functional programming principles with immutable data structures.
 */

import { CardImage, imageManager } from '../managers/image-manager';

// Game status enum
export enum GameStatus {
    READY = 'ready',
    IN_PROGRESS = 'in_progress',
    VICTORY_MUSIC = 'victory_music',
    COMPLETED = 'completed'
}

// Card model with all required properties
export interface Card {
    id: number;
    imageId: number;
    isRevealed: boolean;
    isMatched: boolean;
}

// Game state model
export interface GameState {
    cards: Card[];
    status: GameStatus;
    moves: number;
    selectedCardIds: number[];
    isPreviewMode: boolean;
    cardStyle: 'impressionist' | 'robgon';
    gridSize: 'easy' | 'hard';
}

/**
 * Creates a new initial game state
 * @returns A new game state with cards initialized
 */
export const createInitialGameState = (): GameState => {
    return {
        cards: [],
        status: GameStatus.READY,
        moves: 0,
        selectedCardIds: [],
        isPreviewMode: false,
        cardStyle: 'impressionist',
        gridSize: 'easy'
    };
};

/**
 * Creates a deck of cards with pairs of matching images
 * @param images Array of card images to create pairs from
 * @returns Array of unshuffled cards
 */
export const createCards = (images: CardImage[]): Card[] => {
    const cards: Card[] = [];

    // Create pairs of cards with the same imageId
    images.forEach((image, index) => {
        // First card of the pair
        cards.push({
            id: (index * 2) + 1,
            imageId: image.id,
            isRevealed: false,
            isMatched: false
        });

        // Second card of the pair
        cards.push({
            id: (index * 2) + 2,
            imageId: image.id,
            isRevealed: false,
            isMatched: false
        });
    });

    return cards;
};

/**
 * Initializes a new game with shuffled cards
 * @param totalPairs Number of pairs to create
 * @param shuffleFunction Optional custom shuffle function
 * @returns A new game state with shuffled cards
 */
export const initializeGame = (
    totalPairs: number = 12,
    shuffleFunction?: (cards: Card[]) => Card[]
): GameState => {
    // Get random selection of card images
    const selectedImages = imageManager.getRandomCardImages(totalPairs);

    // Create cards from the selected images
    const cards = createCards(selectedImages);

    // Shuffle the cards if a shuffle function is provided
    const shuffledCards = shuffleFunction ? shuffleFunction(cards) : cards;

    return {
        cards: shuffledCards,
        status: GameStatus.READY,
        moves: 0,
        selectedCardIds: [],
        isPreviewMode: false,
        cardStyle: 'impressionist',
        gridSize: 'easy'
    };
};

/**
 * Initializes a new game with progress tracking from URL parameters
 * @param totalPairs Number of pairs to create
 * @param progress Optional progress parameter (number of pre-matched pairs)
 * @param shuffleFunction Optional custom shuffle function
 * @returns A new game state with shuffled cards and optional progress
 */
export const initializeGameWithProgress = (
    totalPairs: number,
    progress: number | null,
    shuffleFunction?: (cards: Card[]) => Card[]
): GameState => {
    // Create initial game state
    const initialState = initializeGame(totalPairs, shuffleFunction);

    // If progress parameter exists and is valid, pre-match cards
    if (progress && progress > 0 && progress <= totalPairs) {
        // Get the unique imageIds from the shuffled cards
        const uniqueImageIds = Array.from(
            new Set(initialState.cards.map(card => card.imageId))
        );

        // Select the specified number of imageIds to match
        const imageIdsToMatch = uniqueImageIds.slice(0, progress);

        // Update cards to match the pairs with the selected imageIds
        const updatedCards = initialState.cards.map(card => {
            if (imageIdsToMatch.includes(card.imageId)) {
                return { ...card, isMatched: true, isRevealed: true };
            }
            return card;
        });

        // Return updated state with pre-matched cards and adjusted move count
        return {
            ...initialState,
            cards: updatedCards,
            moves: progress,
            status: progress === totalPairs ? GameStatus.VICTORY_MUSIC : GameStatus.IN_PROGRESS,
            isPreviewMode: false,
            cardStyle: 'impressionist',
            gridSize: 'easy'
        };
    }

    // Return regular initial state if no valid progress parameter
    return {
        ...initialState,
        isPreviewMode: false,
        cardStyle: 'impressionist',
        gridSize: 'easy'
    };
};

/**
 * Reveals a card in the game state
 * @param state Current game state
 * @param cardId ID of the card to reveal
 * @returns New game state with the specified card revealed
 */
export const revealCard = (state: GameState, cardId: number): GameState => {
    // Don't allow revealing cards if two are already selected
    if (state.selectedCardIds.length >= 2) {
        return state;
    }

    // Don't allow revealing cards that are already matched or revealed
    const cardToReveal = state.cards.find(card => card.id === cardId);
    if (!cardToReveal || cardToReveal.isMatched || cardToReveal.isRevealed) {
        return state;
    }

    // Create a new array of cards with the specified card revealed
    const updatedCards = state.cards.map(card =>
        card.id === cardId
            ? { ...card, isRevealed: true }
            : card
    );

    // Update selected card IDs
    const updatedSelectedCardIds = [...state.selectedCardIds, cardId];

    return {
        ...state,
        cards: updatedCards,
        selectedCardIds: updatedSelectedCardIds,
        moves: updatedSelectedCardIds.length === 2 ? state.moves + 1 : state.moves
    };
};

/**
 * Checks for matches in the currently selected cards
 * @param state Current game state
 * @returns New game state with matches updated
 */
export const checkForMatches = (state: GameState): GameState => {
    // We need exactly two selected cards to check for matches
    if (state.selectedCardIds.length !== 2) {
        return state;
    }

    const [firstCardId, secondCardId] = state.selectedCardIds;
    const firstCard = state.cards.find(card => card.id === firstCardId);
    const secondCard = state.cards.find(card => card.id === secondCardId);

    // If either card is not found (shouldn't happen), return the state unchanged
    if (!firstCard || !secondCard) {
        return state;
    }

    // Check if the selected cards have matching images
    const isMatch = firstCard.imageId === secondCard.imageId;

    // Create updated cards array
    const updatedCards = state.cards.map(card => {
        // If this is one of the selected cards
        if (card.id === firstCardId || card.id === secondCardId) {
            if (isMatch) {
                // If it's a match, mark as matched
                return { ...card, isMatched: true };
            } else {
                // If not a match, keep the card revealed for now
                // (Another function will handle hiding unmatched cards after delay)
                return card;
            }
        }
        // Leave other cards unchanged
        return card;
    });

    // Check if all cards are matched to update game status
    const allMatched = updatedCards.every(card => card.isMatched);
    const updatedStatus = allMatched ? GameStatus.VICTORY_MUSIC : state.status;

    return {
        ...state,
        cards: updatedCards,
        status: updatedStatus,
        // Clear selected cards if they don't match
        selectedCardIds: isMatch ? [] : state.selectedCardIds
    };
};

/**
 * Hides unmatched revealed cards
 * @param state Current game state
 * @returns New game state with unmatched cards hidden
 */
export const hideUnmatchedCards = (state: GameState): GameState => {
    // No need to hide cards if there aren't two selected
    if (state.selectedCardIds.length !== 2) {
        return state;
    }

    const updatedCards = state.cards.map(card => {
        // If the card is revealed but not matched, hide it
        if (card.isRevealed && !card.isMatched) {
            return { ...card, isRevealed: false };
        }
        return card;
    });

    return {
        ...state,
        cards: updatedCards,
        selectedCardIds: []
    };
};

/**
 * Resets the game to initial state with new shuffled cards
 * @param state Current game state
 * @param shuffleFunction Optional custom shuffle function
 * @returns New game state with reset and shuffled cards
 */
export const resetGame = (
    state: GameState,
    shuffleFunction?: (cards: Card[]) => Card[]
): GameState => {
    const totalPairs = state.cards.length / 2;
    return initializeGame(totalPairs, shuffleFunction);
};

/**
 * Sets preview mode for all cards
 * @param state Current game state
 * @param isPreview Whether to enable preview mode
 * @returns New game state with preview mode updated
 */
export const setPreviewMode = (state: GameState, isPreview: boolean): GameState => {
    return {
        ...state,
        isPreviewMode: isPreview,
        cards: state.cards.map(card => ({
            ...card,
            isRevealed: isPreview ? true : card.isRevealed
        }))
    };
};

/**
 * Updates the card style in the game state
 * @param state Current game state
 * @param style New card style
 * @returns New game state with updated card style
 */
export const updateCardStyle = (state: GameState, style: 'impressionist' | 'robgon'): GameState => {
    return {
        ...state,
        cardStyle: style
    };
};

/**
 * Updates the grid size in the game state
 * @param state Current game state
 * @param size New grid size
 * @returns New game state with updated grid size
 */
export const updateGridSize = (state: GameState, size: 'easy' | 'hard'): GameState => {
    return {
        ...state,
        gridSize: size
    };
};

/**
 * Transitions the game state to victory music
 * @param state Current game state
 * @returns New game state with VICTORY_MUSIC status
 */
export const transitionToVictoryMusic = (state: GameState): GameState => {
    return {
        ...state,
        status: GameStatus.VICTORY_MUSIC
    };
};

/**
 * Transitions the game state to completed
 * @param state Current game state
 * @returns New game state with COMPLETED status
 */
export const transitionToCompleted = (state: GameState): GameState => {
    return {
        ...state,
        status: GameStatus.COMPLETED
    };
}; 