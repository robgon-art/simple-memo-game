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
  @property({ type: String }) flipDirection = 'normal'; // 'normal' = counter-clockwise, 'reverse' = clockwise
  @property({ type: Boolean }) isHorizontal = false; // For celebration animation direction
  @property({ type: Boolean }) isGameCompleted = false; // For tracking game completion
  @property({ type: Number }) phaseOffset = 0; // For animation phase offset

  private animationTimeout: number | null = null;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('matched') && this.matched) {
      // Add animation class when card is matched
      const card = this.shadowRoot?.querySelector('.flip-card');
      card?.classList.add('animate-match');

      // Remove animation class after animation completes
      this.animationTimeout = window.setTimeout(() => {
        card?.classList.remove('animate-match');
      }, 500); // Match the animation duration in CSS
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up timeout if component is removed
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  handleClick(event: MouseEvent) {
    // Prevent flipping already matched cards or currently revealed cards
    if (this.matched || this.revealed) {
      return;
    }

    // Determine flip direction based on click position
    const cardElement = event.currentTarget as HTMLElement;
    const rect = cardElement.getBoundingClientRect();
    const clickX = event.clientX;
    const cardCenterX = rect.left + (rect.width / 2);

    // If clicked on left side, flip clockwise ('reverse')
    // If clicked on right side, flip counter-clockwise ('normal')
    this.flipDirection = clickX < cardCenterX ? 'reverse' : 'normal';

    // Let parent component know the card was flipped
    this.dispatchEvent(new CustomEvent('card-flipped', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const celebrationClass = this.isGameCompleted && this.matched ?
      (this.isHorizontal ? 'celebrate-horizontal' : 'celebrate-vertical') : '';

    // Create a style string for the animation delay
    const animationDelay = this.isGameCompleted && this.matched ? 
      `animation-delay: -${this.phaseOffset}s;` : '';

    return html`
      <div class="flip-card ${this.revealed ? 'revealed' : ''} ${this.matched ? 'matched' : ''} ${celebrationClass}" 
          data-flip-direction="${this.flipDirection}"
          style="${animationDelay}">
        <div class="flip-card-inner">
          <div class="flip-card-back" @click="${this.handleClick}">
            <img src="${this.backImage}" alt="${this.backAlt}" draggable="false">
          </div>
          <div class="flip-card-front">
            <img src="${this.frontImage}" alt="${this.frontAlt}" draggable="false">
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