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

  it('handles animation when card is matched', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?matched=${false}
      ></flip-card>
    `);

    // Initially no animation class
    let cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('animate-match')).toBe(false);

    // Set matched to true
    el.matched = true;
    await el.updateComplete;

    // Should now have the animation class
    cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('animate-match')).toBe(true);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    await el.updateComplete;

    // Animation class should be removed
    cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('animate-match')).toBe(false);
  });

  it('sets flip direction based on click position', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
      ></flip-card>
    `);

    // Mock getBoundingClientRect to return a fixed position
    const mockRect = {
      left: 100,
      width: 100,
      top: 0,
      height: 0,
      right: 200,
      bottom: 0,
      x: 100,
      y: 0,
      toJSON: () => mockRect
    };
    const cardBack = el.shadowRoot!.querySelector('.flip-card-back');
    vi.spyOn(cardBack!, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    // Click on left side (120 is left of center at 150)
    const leftClick = new MouseEvent('click', {
      clientX: 120
    });
    cardBack!.dispatchEvent(leftClick);
    expect(el.flipDirection).toBe('reverse');

    // Click on right side (180 is right of center at 150)
    const rightClick = new MouseEvent('click', {
      clientX: 180
    });
    cardBack!.dispatchEvent(rightClick);
    expect(el.flipDirection).toBe('normal');
  });

  it('applies celebration classes when game is completed', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?matched=${true}
        ?isGameCompleted=${true}
        ?isHorizontal=${true}
      ></flip-card>
    `);

    // Should have horizontal celebration class
    let cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('celebrate-horizontal')).toBe(true);

    // Change to vertical
    el.isHorizontal = false;
    await el.updateComplete;
    cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('celebrate-vertical')).toBe(true);

    // No celebration when not completed
    el.isGameCompleted = false;
    await el.updateComplete;
    cardElement = el.shadowRoot!.querySelector('.flip-card');
    expect(cardElement!.classList.contains('celebrate-horizontal')).toBe(false);
    expect(cardElement!.classList.contains('celebrate-vertical')).toBe(false);
  });

  it('applies animation delay when game is completed', async () => {
    const el = await fixture<FlipCard>(html`
      <flip-card
        frontImage="/test-front.jpg"
        backImage="/test-back.jpg"
        ?matched=${true}
        ?isGameCompleted=${true}
        .phaseOffset=${0.5}
      ></flip-card>
    `);

    const cardElement = el.shadowRoot!.querySelector('.flip-card') as HTMLElement;
    expect(cardElement.style.animationDelay).toBe('-0.5s');

    // No delay when not completed
    el.isGameCompleted = false;
    await el.updateComplete;
    expect(cardElement.style.animationDelay).toBe('');
  });
}); 