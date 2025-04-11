import { describe, it } from 'vitest';
import { fixture, assert, expect } from '@open-wc/testing';
import { html } from 'lit';
import './grid';

describe('Memory Grid', () => {
    it('renders with the expected structure', async () => {
        const el = await fixture(html`<memory-grid></memory-grid>`);

        // Check that the component has rendered
        assert.shadowDom.equal(el, `
      <div class="grid-container">
        <slot></slot>
      </div>
    `);
    });

    it('can contain card elements', async () => {
        // Create a mock card element for testing
        const mockCard = document.createElement('div');
        mockCard.className = 'mock-card';
        mockCard.textContent = 'Test Card';

        const el = await fixture(html`
      <memory-grid>
        ${mockCard}
      </memory-grid>
    `);

        // Verify the card was slotted correctly
        const slot = el.shadowRoot!.querySelector('slot');
        expect(slot).to.exist;

        // Get the assigned nodes (should include our mock card)
        const assignedNodes = slot!.assignedNodes();
        expect(assignedNodes.length).to.equal(1);
        expect(assignedNodes[0]).to.equal(mockCard);
    });
}); 