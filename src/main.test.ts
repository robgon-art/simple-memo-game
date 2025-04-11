import { describe, it } from 'vitest';
import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';
import './main';
import { MainElement } from './main';

describe('MainElement', () => {
    it('renders with default values', async () => {
        const el = await fixture<MainElement>(html`<main-element></main-element>`);
        expect(el.name).to.equal('World');
        expect(el.shadowRoot).to.exist;
        expect(el.shadowRoot!.querySelector('h1')?.textContent).to.include('Hello, World!');
    });

    it('renders with custom name', async () => {
        const el = await fixture<MainElement>(html`<main-element name="Test"></main-element>`);
        expect(el.name).to.equal('Test');
        expect(el.shadowRoot!.querySelector('h1')?.textContent).to.include('Hello, Test!');
    });
}); 