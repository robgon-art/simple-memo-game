import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import cardStyles from './card.css?inline';

@customElement('flip-card')
export class FlipCard extends LitElement {
  @property({ type: String }) frontImage = '';
  @property({ type: String }) backImage = '';
  @property({ type: String }) frontAlt = '';
  @property({ type: String }) backAlt = '';
  @property({ type: Boolean, reflect: true }) revealed = false;
  @property({ type: Boolean, reflect: true }) matched = false;

  handleClick() {
    // Prevent flipping already matched cards or currently revealed cards
    if (this.matched || this.revealed) {
      return;
    }

    // Let parent component know the card was flipped
    this.dispatchEvent(new CustomEvent('card-flipped', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="flip-card ${this.revealed ? 'revealed' : ''} ${this.matched ? 'matched' : ''}">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="${this.frontImage}" alt="${this.frontAlt}">
          </div>
          <div class="flip-card-back" @click="${this.handleClick}">
            <img src="${this.backImage}" alt="${this.backAlt}">
          </div>
        </div>
      </div>
    `;
  }

  static styles = unsafeCSS(cardStyles);
}

declare global {
  interface HTMLElementTagNameMap {
    'flip-card': FlipCard
  }
} 