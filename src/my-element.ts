import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/card.ts'
import { imageManager } from './managers/image-manager.ts'

// Detect if we're in a test environment (either Node.js or via Vitest)
const isTestEnvironment = typeof process !== 'undefined' || 
                         (typeof window !== 'undefined' && 
                          typeof (window as any).__vitest__ !== 'undefined');

// Only log in non-test environments
if (!isTestEnvironment) {
  console.log('MyElement initialized, imageManager loaded');
}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  constructor() {
    super();
    // Only log in non-test environments
    if (!isTestEnvironment) {
      console.log('MyElement initialized, imageManager should be loaded:', imageManager);
    }
  }

  render() {
    return html`
      <div class="app-container">
        <flip-card 
          frontImage="/cards/A Sunday Afternoon on the Island of La Grande Jatte, Georges Seurat, 1884.jpg"
          backImage="/Back Side.jpg"
        ></flip-card>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100vh;
      background-color: black;
    }

    .app-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
