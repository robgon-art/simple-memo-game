import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import cardStyles from './card.css?inline';

@customElement('flip-card')
export class Card extends LitElement {
    @property({ type: String }) frontImage = '';
    @property({ type: String }) backImage = '';
    @property({ type: String }) frontAlt = 'Card Front';
    @property({ type: String }) backAlt = 'Card Back';

    @state() private isFlipped = false;

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
    }

    static styles = unsafeCSS(cardStyles);
}

declare global {
    interface HTMLElementTagNameMap {
        'flip-card': Card
    }
} 