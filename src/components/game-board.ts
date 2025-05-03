import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import './grid';
import './card';
import gameBoardStyles from './game-board.css?inline';
import { GameState, GameStatus, initializeGame } from '../models/game-state';
import { selectCard } from '../functions/card-selection';
import { processMatches } from '../functions/match-checking';
import { clearSelectedCards } from '../functions/card-selection';
import { shuffleCards } from '../functions/shuffle';
import imageManager from '../managers/image-manager';
import { AudioManager, audioManager as defaultAudioManager } from '../managers/audio-manager';
import { TimerService, defaultTimerService } from '../services/timer-service';

// GameCompletionCallback type for easier testing of game completion
export type GameCompletionCallback = (moves: number) => void;

@customElement('memory-game-board')
export class GameBoard extends LitElement {
  @state() gameState: GameState;

  @property({ type: Object })
  timerService: TimerService = defaultTimerService;

  @property({ type: Object })
  audioManager: AudioManager = defaultAudioManager;

  @property({ type: Function })
  onGameCompleted: GameCompletionCallback = (moves) => {
    console.log(`Game completed in ${moves} moves!`);
  };

  private backImage = '/Back Side.jpg';
  private backAlt = 'Card Back';
  private matchCheckTimer: number | null = null;
  private revealDelay = 2000; // Time in ms to keep unmatched cards revealed

  constructor() {
    super();
    this.gameState = this.initializeGameState();
  }

  /**
   * Initialize a new game state with shuffled cards
   */
  initializeGameState(): GameState {
    // Check if there's a progress parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const progressParam = urlParams.get('progress');
    
    // Create initial game state
    const initialState = initializeGame(12, shuffleCards);
    
    // If progress parameter exists and is valid, pre-match cards
    if (progressParam) {
      const progress = parseInt(progressParam, 10);
      
      // Validate progress is between 0 and total pairs
      if (!isNaN(progress) && progress >= 0 && progress <= 12) {
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
          // Set moves to the number of matches (one move per match)
          moves: progress,
          // Game is completed if all pairs are matched
          status: progress === 12 ? GameStatus.COMPLETED : GameStatus.IN_PROGRESS
        };
      }
    }
    
    // Return regular initial state if no valid progress parameter
    return initialState;
  }

  /**
   * Handle card flip event from a card component
   */
  handleCardFlip(event: CustomEvent, cardId: number) {
    // Prevent default handling
    event.stopPropagation();

    // Play card flip sound
    this.audioManager.playEffect('cardFlip');

    // If there's a pending timer for clearing mismatched cards
    // and the user clicks a new card, clear the cards immediately
    if (this.matchCheckTimer !== null && this.gameState.selectedCardIds.length === 2 && !this.gameState.cards.find(card => card.id === cardId)?.isRevealed) {
      // Clear the timeout
      this.timerService.clearTimeout(this.matchCheckTimer);
      this.matchCheckTimer = null;

      // Reset the mismatched cards and ensure any matching state is also reset
      const clearedState = clearSelectedCards(this.gameState);

      // Make sure none of the previously selected cards are marked as matched incorrectly
      const selectedCardIds = this.gameState.selectedCardIds;
      const fullyResetState = {
        ...clearedState,
        cards: clearedState.cards.map(card =>
          selectedCardIds.includes(card.id) ? { ...card, isMatched: false, isRevealed: false } : card
        )
      };

      // Play card flip sound for cards flipping back
      this.audioManager.playEffect('cardFlip');

      // Update game state with reset cards before processing the new selection
      this.gameState = fullyResetState;

      // Now select the new card after proper cleanup
      this.gameState = selectCard(this.gameState, cardId);
    } else {
      // Normal case - just update game state with the selected card
      this.gameState = selectCard(this.gameState, cardId);
    }

    // After selecting the second card, check for a match
    if (this.gameState.selectedCardIds.length === 2) {
      this.checkForMatches();
    }
  }

  /**
   * Check for matches and handle the result
   */
  checkForMatches() {
    // Process matches in the current game state
    const updatedState = processMatches(this.gameState);

    // If there was a match, play match sound
    if (updatedState.selectedCardIds.length === 0 &&
      this.gameState.selectedCardIds.length === 2) {
      this.audioManager.playEffect('match');
    }

    this.gameState = updatedState;

    // If there was no match, set a timer to flip the cards back
    if (this.gameState.selectedCardIds.length === 2) {
      // Cancel any existing timer
      if (this.matchCheckTimer !== null) {
        this.timerService.clearTimeout(this.matchCheckTimer);
      }

      // Set a new timer to flip cards back after the delay
      this.matchCheckTimer = this.timerService.setTimeout(() => {
        // Play card flip sound for cards flipping back
        this.audioManager.playEffect('cardFlip');

        this.gameState = clearSelectedCards(this.gameState);
        this.matchCheckTimer = null;
      }, this.revealDelay);
    }

    // Check for game completion
    if (this.gameState.status === GameStatus.COMPLETED) {
      this.handleGameCompletion();
    }
  }

  /**
   * Handle game completion
   */
  handleGameCompletion() {
    // Call the completion callback
    this.onGameCompleted(this.gameState.moves);

    // The completion music is now handled in match-checking.ts after the aero chime
  }

  /**
   * Restart the game
   */
  restartGame() {
    // Cancel any pending timers
    if (this.matchCheckTimer !== null) {
      this.timerService.clearTimeout(this.matchCheckTimer);
      this.matchCheckTimer = null;
    }

    // Stop any playing music
    this.audioManager.stopMusic();

    // Play a sound for game reset
    this.audioManager.playEffect('cardFlip');

    // Initialize a new game state
    this.gameState = this.initializeGameState();
  }

  /**
   * Get the image path for a card based on its imageId
   */
  private getCardImagePath(imageId: number): string {
    const image = imageManager.getCardImageById(imageId);
    return image ? image.path : '';
  }

  /**
   * Get the alt text for a card based on its imageId
   */
  private getCardAltText(imageId: number): string {
    const image = imageManager.getCardImageById(imageId);
    return image ? image.name : 'Card';
  }

  render() {
    return html`
      <div class="memory-game">
        <h1>Memory Matching Game</h1>
        <div class="game-stats">
          <p>Moves: ${this.gameState.moves}</p>
          ${this.gameState.status === GameStatus.COMPLETED
        ? html`<p class="game-complete">Game Complete!</p>`
        : ''}
        </div>
        <memory-grid>
          ${this.gameState.cards.map(card => html`
            <flip-card
              .frontImage=${this.getCardImagePath(card.imageId)}
              .backImage=${this.backImage}
              .frontAlt=${this.getCardAltText(card.imageId)}
              .backAlt=${this.backAlt}
              ?revealed=${card.isRevealed}
              ?matched=${card.isMatched}
              @card-flipped=${(e: CustomEvent) => this.handleCardFlip(e, card.id)}
            ></flip-card>
          `)}
        </memory-grid>
        <button @click=${this.restartGame} class="restart-button">Restart Game</button>
      </div>
    `;
  }

  static styles = unsafeCSS(gameBoardStyles);
}

declare global {
  interface HTMLElementTagNameMap {
    'memory-game-board': GameBoard
  }
} 