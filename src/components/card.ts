import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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

    static styles = css`
    :host {
      display: block;
    }

    .card-container {
      width: 300px;
      height: 450px;
      perspective: 1000px;
      cursor: pointer;
    }

    .card {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.8s;
    }

    .card.flipped {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .front {
      transform: rotateY(0deg);
    }

    .back {
      transform: rotateY(180deg);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'flip-card': Card
    }
} 