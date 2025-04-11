import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import './my-element.ts';
import { MyElement } from './my-element.ts';

// Create a mock for the flip-card component to isolate testing
class MockFlipCard extends HTMLElement {
    static get observedAttributes() {
        return ['frontimage', 'backimage'];
    }

    connectedCallback() {
        // Create basic structure to mimic the real component
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<div class="card-mock">Mock Card</div>`;
    }
}

// Only define if not already defined
if (!customElements.get('flip-card')) {
    customElements.define('flip-card', MockFlipCard);
}

describe('my-element', () => {
    let element: MyElement;

    beforeEach(async () => {
        // Create the element
        element = await fixture<MyElement>(html`<my-element></my-element>`);
    });

    afterEach(() => {
        element.remove();
    });

    it('renders with the correct structure', () => {
        // Check app container exists
        const container = element.shadowRoot!.querySelector('.app-container');
        expect(container).not.toBeNull();
    });

    it('renders the flip-card component with correct attributes', () => {
        // Check flip-card exists
        const flipCard = element.shadowRoot!.querySelector('flip-card');
        expect(flipCard).not.toBeNull();

        // Check props were passed correctly
        expect(flipCard!.getAttribute('frontImage')).to.include('A Sunday Afternoon on the Island of La Grande Jatte');
        expect(flipCard!.getAttribute('backImage')).to.equal('/Back Side.jpg');
    });

    it('has correct CSS styling', () => {
        // Get computed styles from the shadowRoot
        const container = element.shadowRoot!.querySelector('.app-container') as HTMLElement;
        expect(container).not.toBeNull();

        // Check app-container styles (can't check host directly in this context)
        const containerStyles = getComputedStyle(container);
        expect(containerStyles.display).to.equal('flex');
        expect(containerStyles.justifyContent).to.equal('center');
        expect(containerStyles.alignItems).to.equal('center');
    });
}); 