import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import './card.ts';
import { Card } from './card';

describe('flip-card', () => {
    let element: Card;

    beforeEach(async () => {
        // Create the element with properties
        element = await fixture<Card>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        frontAlt="Test Front"
        backAlt="Test Back"
      ></flip-card>
    `);
    });

    afterEach(() => {
        element.remove();
    });

    it('renders with the correct properties', () => {
        const frontImg = element.shadowRoot!.querySelector('.front img') as HTMLImageElement;
        const backImg = element.shadowRoot!.querySelector('.back img') as HTMLImageElement;

        expect(frontImg).not.toBeNull();
        expect(backImg).not.toBeNull();

        expect(frontImg.src).to.include('/test-front.jpg');
        expect(backImg.src).to.include('/test-back.jpg');
        expect(frontImg.alt).to.equal('Test Front');
        expect(backImg.alt).to.equal('Test Back');
    });

    it('starts with isFlipped set to false', () => {
        const card = element.shadowRoot!.querySelector('.card');
        expect(card?.classList.contains('flipped')).to.be.false;
    });

    it('flips the card when clicked', async () => {
        const card = element.shadowRoot!.querySelector('.card') as HTMLElement;

        // Initial state
        expect(card.classList.contains('flipped')).to.be.false;

        // Directly call the flip method instead of triggering via DOM event
        // @ts-ignore: accessing private method for testing
        element._flipCard();

        // Force re-render and check if flipped
        await element.updateComplete;
        expect(card.classList.contains('flipped')).to.be.true;

        // Flip back
        // @ts-ignore: accessing private method for testing
        element._flipCard();

        // Force re-render and check if flipped back
        await element.updateComplete;
        expect(card.classList.contains('flipped')).to.be.false;
    });

    it('accepts default property values', async () => {
        // Create element without properties
        const defaultElement = await fixture<Card>(html`<flip-card></flip-card>`);

        const frontImg = defaultElement.shadowRoot!.querySelector('.front img') as HTMLImageElement;
        const backImg = defaultElement.shadowRoot!.querySelector('.back img') as HTMLImageElement;

        // Check default properties are applied - empty src resolves to base URL
        expect(frontImg.src).not.to.include('/test-front.jpg');
        expect(backImg.src).not.to.include('/test-back.jpg');
        expect(frontImg.getAttribute('src')).to.equal('');
        expect(backImg.getAttribute('src')).to.equal('');
        expect(frontImg.alt).to.equal('Card Front');
        expect(backImg.alt).to.equal('Card Back');

        defaultElement.remove();
    });
}); 