import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import gridStyles from './grid.css?inline';

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
    // Scale factor to make cards 20% larger
    const scaleFactor = 1.25;

    // Calculate available space
    const availableWidth = containerWidth - (padding * 2) - (gap * (columns - 1));
    const availableHeight = containerHeight - (padding * 2) - (gap * (rows - 1));

    // Calculate max card dimensions while preserving 3:4 aspect ratio
    const maxCardWidth = availableWidth / columns;
    const maxCardHeight = availableHeight / rows;

    // Determine optimal size based on aspect ratio (3:4)
    let optimalWidth, optimalHeight;

    if (maxCardWidth / maxCardHeight > 0.8) { // Changed from 0.75 to 0.85
      // Height constrained
      optimalHeight = maxCardHeight;
      optimalWidth = optimalHeight * 0.8; // Changed from 0.75 to 0.85
    } else {
      // Width constrained
      optimalWidth = maxCardWidth;
      optimalHeight = optimalWidth / 0.8; // Changed from 0.75 to 0.85
    }

    // Apply scaling factor to make cards larger
    optimalWidth = Math.min(optimalWidth * scaleFactor, maxCardWidth);
    optimalHeight = Math.min(optimalHeight * scaleFactor, maxCardHeight);

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

  static styles = unsafeCSS(gridStyles);
}

declare global {
  interface HTMLElementTagNameMap {
    'memory-grid': Grid
  }
} 