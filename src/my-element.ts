import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/card.ts'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
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
