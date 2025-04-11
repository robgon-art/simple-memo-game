import { describe, it } from 'vitest';
import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';
import './game-board';
import { GameBoard } from './game-board';

describe('Memory Game Board', () => {
    it('renders with 24 cards', async () => {
        const el = await fixture<GameBoard>(html`<memory-game-board></memory-game-board>`);

        // Verify that the game board renders
        expect(el).to.exist;
        expect(el.shadowRoot).to.exist;

        // Check that there are 24 card elements
        const cards = el.shadowRoot!.querySelectorAll('flip-card');
        expect(cards.length).to.equal(24);
    });

    it('initializes cards with correct data', async () => {
        const el = await fixture<GameBoard>(html`<memory-game-board></memory-game-board>`);

        // Access the cards internal state (for testing purposes)
        const cards = (el as any).cards;

        // Verify we have 24 cards
        expect(cards.length).to.equal(24);

        // Verify each card has the required properties
        cards.forEach((card: any) => {
            expect(card).to.have.property('id');
            expect(card).to.have.property('imagePath');
            expect(card).to.have.property('imageAlt');
            expect(card).to.have.property('pairId');
            expect(card).to.have.property('isRevealed');
            expect(card.isRevealed).to.be.false;
        });

        // Verify we have 12 unique pairs (pairId values from 0-11)
        const uniquePairIds = new Set(cards.map((card: any) => card.pairId));
        expect(uniquePairIds.size).to.equal(12);
    });
}); 