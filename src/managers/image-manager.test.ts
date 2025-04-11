import { describe, it, expect, beforeAll } from 'vitest';
import { imageManager } from './image-manager';

// Explicitly ensure silent mode is set
imageManager.setSilent(true);

describe('ImageManager', () => {
    // Also set silent mode in beforeAll to be safe
    beforeAll(() => {
        imageManager.setSilent(true);
    });

    describe('initialization', () => {
        it('has already loaded images (singleton pattern)', () => {
            // Since imageManager is a singleton that initializes on import,
            // we verify that it has already loaded the images
            expect(imageManager.getAllCardImages()).to.have.lengthOf(12);
        });
    });

    describe('getAllCardImages', () => {
        it('returns all card images', () => {
            const images = imageManager.getAllCardImages();
            expect(images).to.be.an('array');
            expect(images).to.have.lengthOf(12);

            // Check if images have the expected structure
            const firstImage = images[0];
            expect(firstImage).to.have.property('id');
            expect(firstImage).to.have.property('name');
            expect(firstImage).to.have.property('path');
        });

        it('returns a copy of the card images array', () => {
            const images1 = imageManager.getAllCardImages();
            const images2 = imageManager.getAllCardImages();

            // Should return a new array instance each time
            expect(images1).to.not.equal(images2);

            // But the content should be the same
            expect(images1).to.deep.equal(images2);
        });
    });

    describe('getCardImageById', () => {
        it('returns the correct card image by ID', () => {
            // Get an image with ID 1
            const image = imageManager.getCardImageById(1);

            expect(image).to.not.be.undefined;
            expect(image?.id).to.equal(1);
            expect(image?.name).to.include('Sunday');
            expect(image?.path).to.include('A Sunday Afternoon');
        });

        it('returns undefined for non-existent ID', () => {
            // Try to get an image with an ID that doesn't exist
            const image = imageManager.getCardImageById(999);

            expect(image).to.be.undefined;
        });
    });

    describe('getCardBackImagePath', () => {
        it('returns the correct back image path', () => {
            const backImagePath = imageManager.getCardBackImagePath();

            expect(backImagePath).to.equal('/Back Side.jpg');
        });
    });

    describe('getCardPairs', () => {
        it('returns pairs of all card images (24 cards total)', () => {
            const pairs = imageManager.getCardPairs();

            // Should return 24 cards (12 pairs)
            expect(pairs).to.have.lengthOf(24);

            // Check that every card appears exactly twice
            const counts = new Map<number, number>();

            pairs.forEach(card => {
                const id = card.id;
                counts.set(id, (counts.get(id) || 0) + 1);
            });

            // Each ID should appear exactly twice
            counts.forEach((count, id) => {
                expect(count).to.equal(2, `Card with ID ${id} should appear exactly twice`);
            });
        });

        it('returns deep copies of the cards', () => {
            const pairs = imageManager.getCardPairs();

            // Find two cards with the same ID
            const id = pairs[0].id;
            const firstCard = pairs.find(card => card.id === id);
            const secondCard = pairs.filter(card => card.id === id)[1];

            expect(firstCard).to.not.be.undefined;
            expect(secondCard).to.not.be.undefined;

            // They should be distinct objects with the same properties
            expect(firstCard).to.not.equal(secondCard);
            expect(firstCard).to.deep.equal(secondCard);
        });
    });

    describe('loadCardImages functionality', () => {
        it('properly extracts names from image paths', () => {
            // Test the naming logic by checking the actual loaded images
            const images = imageManager.getAllCardImages();
            
            // Check a few specific images to verify naming logic
            const sundayAfternoon = images.find(img => img.path.includes('A Sunday Afternoon'));
            expect(sundayAfternoon).to.not.be.undefined;
            expect(sundayAfternoon?.name).to.include('Sunday');
            
            const starryNight = images.find(img => img.path.includes('Starry Night'));
            expect(starryNight).to.not.be.undefined;
            expect(starryNight?.name).to.include('Starry');
        });

        it('assigns unique IDs to all images', () => {
            const images = imageManager.getAllCardImages();
            
            // Get all IDs
            const ids = images.map(img => img.id);
            
            // Create a Set to get only unique IDs
            const uniqueIds = new Set(ids);
            
            // If all IDs are unique, the Set size should match the array length
            expect(uniqueIds.size).to.equal(images.length);
        });
    });
}); 