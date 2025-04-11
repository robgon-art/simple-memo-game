/**
 * Memory Game State Model
 * 
 * Implements game state using functional programming principles with immutable data structures.
 */

// Game status enum
export enum GameStatus {
    IN_PROGRESS = 'in_progress',
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
}

/**
 * Creates a new initial game state
 * @returns A new game state with cards initialized
 */
export const createInitialGameState = (): GameState => {
    return {
        cards: [],
        status: GameStatus.IN_PROGRESS,
        moves: 0,
        selectedCardIds: []
    };
};

/**
 * Creates a deck of cards with pairs of matching images
 * @param totalPairs Number of image pairs to create
 * @returns Array of unshuffled cards
 */
export const createCards = (totalPairs: number): Card[] => {
    const cards: Card[] = [];

    // Create pairs of cards with the same imageId
    for (let imageId = 1; imageId <= totalPairs; imageId++) {
        // First card of the pair
        cards.push({
            id: (imageId * 2) - 1,
            imageId,
            isRevealed: false,
            isMatched: false
        });

        // Second card of the pair
        cards.push({
            id: imageId * 2,
            imageId,
            isRevealed: false,
            isMatched: false
        });
    }

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
    const cards = createCards(totalPairs);
    const shuffledCards = shuffleFunction ? shuffleFunction(cards) : cards;

    return {
        cards: shuffledCards,
        status: GameStatus.IN_PROGRESS,
        moves: 0,
        selectedCardIds: []
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
    const updatedStatus = allMatched ? GameStatus.COMPLETED : state.status;

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