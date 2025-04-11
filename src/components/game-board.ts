import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './grid';
import './card';
import gameBoardStyles from './game-board.css?inline';

interface CardData {
  id: number;
  imagePath: string;
  imageAlt: string;
  pairId: number;
  isRevealed: boolean;
}

@customElement('memory-game-board')
export class GameBoard extends LitElement {
  @state() private cards: CardData[] = [];
  private backImage = '/Back Side.jpg';
  private backAlt = 'Card Back';

  constructor() {
    super();
    this.initializeCards();
  }

  initializeCards() {
    const cardImages = [
      { path: '/cards/A Sunday Afternoon on the Island of La Grande Jatte, Georges Seurat, 1884.jpg', alt: 'Seurat - A Sunday Afternoon' },
      { path: '/cards/Mont Sainte-Victoire, Paul Cézanne, c. 1890s.jpg', alt: 'Cézanne - Mont Sainte-Victoire' },
      { path: '/cards/Jeanne Samary in a Low-Necked Dress, Pierre-Auguste Renoir, 1877.jpg', alt: 'Renoir - Jeanne Samary' },
      { path: '/cards/Children Playing on the Beach, Mary Cassatt, 1884.jpg', alt: 'Cassatt - Children Playing' },
      { path: '/cards/The Green Line, Henri Matisse, 1905.jpg', alt: 'Matisse - The Green Line' },
      { path: '/cards/The Starry Night, Vincent van Gogh, 1889.jpg', alt: 'Van Gogh - Starry Night' },
      { path: '/cards/Le Déjeuner sur l\'herbe, Édouard Manet, 1863.jpg', alt: 'Manet - Le Déjeuner sur l\'herbe' },
      { path: '/cards/Dance at Bougival, Pierre-Auguste Renoir, 1883.jpg', alt: 'Renoir - Dance at Bougival' },
      { path: '/cards/The Ballet Class, Edgar Degas, 1873.jpg', alt: 'Degas - The Ballet Class' },
      { path: '/cards/Boulevard Montmartre, Spring, Camille Pissarro, 1897.jpg', alt: 'Pissarro - Boulevard Montmartre' },
      { path: '/cards/At the Moulin Rouge - The Dance, Henri de Toulouse-Lautrec, 1890.jpg', alt: 'Toulouse-Lautrec - At the Moulin Rouge' },
      { path: '/cards/Impression Sunrise, Claude Monet, 1872.jpg', alt: 'Monet - Impression Sunrise' }
    ];

    // Create pairs of cards
    const cardPairs: CardData[] = [];

    cardImages.forEach((image, index) => {
      // Create first card in pair
      cardPairs.push({
        id: index * 2,
        imagePath: image.path,
        imageAlt: image.alt,
        pairId: index,
        isRevealed: false
      });

      // Create second card in pair
      cardPairs.push({
        id: index * 2 + 1,
        imagePath: image.path,
        imageAlt: image.alt,
        pairId: index,
        isRevealed: false
      });
    });

    this.cards = cardPairs;
  }

  handleCardFlip(event: CustomEvent, cardId: number) {
    // Prevent default handling so we can use our own logic
    event.stopPropagation();

    // Update our model with the new state
    this.cards = this.cards.map(card =>
      card.id === cardId ? { ...card, isRevealed: !card.isRevealed } : card
    );
  }

  render() {
    return html`
      <div class="memory-game">
        <h1>Memory Matching Game</h1>
        <memory-grid>
          ${this.cards.map(card => html`
            <flip-card
              .frontImage=${card.imagePath}
              .backImage=${this.backImage}
              .frontAlt=${card.imageAlt}
              .backAlt=${this.backAlt}
              ?revealed=${card.isRevealed}
              @card-flipped=${(e: CustomEvent) => this.handleCardFlip(e, card.id)}
            ></flip-card>
          `)}
        </memory-grid>
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