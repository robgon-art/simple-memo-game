// This file was renamed from my-element.ts to main.ts
// Import any global application components here
import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import mainStyles from './main.css?inline'
// Import the game board component
import './components/game-board';

/**
 * Main application element
 */
@customElement('main-element')
export class MainElement extends LitElement {
    @property({ type: String })
    name = 'World'

    constructor() {
        super();
        // Add event listener for game initialization
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Memory Game initialized');
        });
    }

    render() {
        return html`
      <div>
        <h1>Hello, ${this.name}!</h1>
      </div>
    `
    }

    static styles = unsafeCSS(mainStyles);
}

declare global {
    interface HTMLElementTagNameMap {
        'main-element': MainElement
    }
} 