import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import cardStyles from './card.css?inline';

@customElement('flip-card')
export class Card extends LitElement {
  @property({ type: String }) frontImage = '';
  @property({ type: String }) backImage = '';
  @property({ type: String }) frontAlt = 'Card Front';
  @property({ type: String }) backAlt = 'Card Back';
  @property({ type: Boolean }) revealed = false;

  @state() private isFlipped = false;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('revealed')) {
      this.isFlipped = this.revealed;
    }
  }

  render() {
    return html`
      <div class="card-container">
        <div class="card ${this.isFlipped ? 'flipped' : ''}" @click=${this._flipCard}>
          <div class="card-face front">
            <img src="${this.frontImage}" alt="${this.frontAlt}">
          </div>
          <div class="card-face back">
            <img src="${this.backImage}" alt="${this.backAlt}">
          </div>
        </div>
      </div>
    `;
  }

  private _flipCard() {
    this.isFlipped = !this.isFlipped;
    // Dispatch event to notify parent
    this.dispatchEvent(new CustomEvent('card-flipped', {
      bubbles: true,
      composed: true,
      detail: { flipped: this.isFlipped }
    }));
  }

  // Public method to flip the card programmatically
  flipCard(flip = true) {
    this.isFlipped = flip;
  }

  static styles = unsafeCSS(cardStyles);
}

declare global {
  interface HTMLElementTagNameMap {
    'flip-card': Card
  }
} 