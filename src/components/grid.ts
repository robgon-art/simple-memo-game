import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import gridStyles from './grid.css?inline';
import { calculateGridLayout } from '../utils/grid-layout';

@customElement('memory-grid')
export class Grid extends LitElement {
  private resizeObserver: ResizeObserver;
  @property({ type: Number }) numPairs = 12;

  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(() => this.updateCardSizes());
  }

  // Watch for numPairs changes
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('numPairs')) {
      this.updateCardSizes();
    }
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

    // Always use the optimal grid layout for the number of pairs
    const layout = calculateGridLayout(this.numPairs);

    const gap = 12;
    const padding = 8;
    // Scale factor to make cards 20% larger
    const scaleFactor = 1.25;

    // Calculate available space
    const availableWidth = containerWidth - (padding * 2) - (gap * (layout.columns - 1));
    const availableHeight = containerHeight - (padding * 2) - (gap * (layout.rows - 1));

    // Calculate max card dimensions while preserving 0.8 aspect ratio
    const maxCardWidth = availableWidth / layout.columns;
    const maxCardHeight = availableHeight / layout.rows;

    // Determine optimal size based on aspect ratio (0.8)
    let optimalWidth, optimalHeight;

    if (maxCardWidth / maxCardHeight > 0.8) {
      // Height constrained
      optimalHeight = maxCardHeight;
      optimalWidth = optimalHeight * 0.8;
    } else {
      // Width constrained
      optimalWidth = maxCardWidth;
      optimalHeight = optimalWidth / 0.8;
    }

    // Apply scaling factor to make cards larger
    optimalWidth = Math.min(optimalWidth * scaleFactor, maxCardWidth);
    optimalHeight = Math.min(optimalHeight * scaleFactor, maxCardHeight);

    // Apply the styles to the CSS variables
    this.style.setProperty('--card-width', `${optimalWidth}px`);
    this.style.setProperty('--card-height', `${optimalHeight}px`);
    this.style.setProperty('--grid-columns', `${layout.columns}`);
    this.style.setProperty('--grid-rows', `${layout.rows}`);
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