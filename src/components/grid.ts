import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('memory-grid')
export class Grid extends LitElement {
  private resizeObserver: ResizeObserver;

  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(() => this.updateCardSizes());
  }

  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver.unobserve(this);
  }

  updateCardSizes() {
    // Get container dimensions
    const containerWidth = this.clientWidth;
    // Use 95% of the viewport height for cards
    const containerHeight = window.innerHeight * 0.95;

    // Define grid dimensions
    const columns = 8;
    const rows = 3;
    const gap = 12;
    const padding = 8;

    // Calculate available space
    const availableWidth = containerWidth - (padding * 2) - (gap * (columns - 1));
    const availableHeight = containerHeight - (padding * 2) - (gap * (rows - 1));

    // Calculate max card dimensions while preserving 3:4 aspect ratio
    const maxCardWidth = availableWidth / columns;
    const maxCardHeight = availableHeight / rows;

    // Determine optimal size based on aspect ratio (3:4)
    let optimalWidth, optimalHeight;

    if (maxCardWidth / maxCardHeight > 0.75) { // 3:4 = 0.75
      // Height constrained
      optimalHeight = maxCardHeight;
      optimalWidth = optimalHeight * 0.75;
    } else {
      // Width constrained
      optimalWidth = maxCardWidth;
      optimalHeight = optimalWidth / 0.75;
    }

    // Apply the styles to the CSS variables
    this.style.setProperty('--card-width', `${optimalWidth}px`);
    this.style.setProperty('--card-height', `${optimalHeight}px`);
  }

  firstUpdated() {
    this.updateCardSizes();
  }

  render() {
    return html`
      <div class="grid-container">
        <slot></slot>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 98%;
      max-width: 1600px;
      margin: 0 auto;
      --card-width: 160px;
      --card-height: 213px;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 12px;
      padding: 8px;
    }

    /* Make sure flip-card elements adjust to grid cell size */
    ::slotted(flip-card) {
      width: var(--card-width);
      height: var(--card-height);
      min-height: 100px;
    }

    @media (max-width: 1200px) {
      .grid-container {
        grid-template-columns: repeat(6, 1fr);
        grid-template-rows: repeat(4, 1fr);
      }
    }

    @media (max-width: 900px) {
      .grid-container {
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(6, 1fr);
      }
    }

    @media (max-width: 600px) {
      .grid-container {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(8, 1fr);
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .grid-container {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(12, 1fr);
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'memory-grid': Grid
  }
} 