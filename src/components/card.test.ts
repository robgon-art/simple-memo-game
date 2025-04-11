import { describe, it, expect, vi } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { FlipCard } from './card';
import './card';

describe('FlipCard Component', () => {
  it('renders with correct structure', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        frontAlt="Test Front"
        backAlt="Test Back"
      ></flip-card>
    `);

    expect(el.shadowRoot).toBeDefined();

    // Check the images are set correctly
    const frontImg = el.shadowRoot!.querySelector('.flip-card-front img') as HTMLImageElement;
    const backImg = el.shadowRoot!.querySelector('.flip-card-back img') as HTMLImageElement;

    expect(frontImg).toBeDefined();
    expect(backImg).toBeDefined();
    expect(frontImg.src).toContain('/test-front.jpg');
    expect(backImg.src).toContain('/test-back.jpg');
    expect(frontImg.alt).toBe('Test Front');
    expect(backImg.alt).toBe('Test Back');
  });

  it('flips when clicked and emits event', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
      ></flip-card>
    `);

    // Setup event listener to capture the custom event
    const eventSpy = vi.fn();
    el.addEventListener('card-flipped', eventSpy);

    // Click the card back
    const cardBack = el.shadowRoot!.querySelector('.flip-card-back');
    cardBack!.dispatchEvent(new MouseEvent('click'));

    // Check if the event was dispatched
    expect(eventSpy).toHaveBeenCalledTimes(1);
  });

  it('toggles revealed state when property changes', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?revealed=${false}
      ></flip-card>
    `);

    // Initially not revealed
    let cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('revealed')).toBe(false);

    // Set revealed to true
    el.revealed = true;
    await el.updateComplete;

    // Should now have the revealed class
    cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('revealed')).toBe(true);
  });

  it('supports matched state', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?matched=${true}
      ></flip-card>
    `);

    // Should have the matched class
    const cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('matched')).toBe(true);
  });

  it('does not emit event when already matched', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?matched=${true}
      ></flip-card>
    `);

    // Setup event listener to capture the custom event
    const eventSpy = vi.fn();
    el.addEventListener('card-flipped', eventSpy);

    // Click the card back
    const cardBack = el.shadowRoot!.querySelector('.flip-card-back');
    cardBack!.dispatchEvent(new MouseEvent('click'));

    // No event should be dispatched when card is already matched
    expect(eventSpy).not.toHaveBeenCalled();
  });

  it('does not emit event when already revealed', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?revealed=${true}
      ></flip-card>
    `);

    // Setup event listener to capture the custom event
    const eventSpy = vi.fn();
    el.addEventListener('card-flipped', eventSpy);

    // Click the card back
    const cardBack = el.shadowRoot!.querySelector('.flip-card-back');
    cardBack!.dispatchEvent(new MouseEvent('click'));

    // No event should be dispatched when card is already revealed
    expect(eventSpy).not.toHaveBeenCalled();
  });
}); 