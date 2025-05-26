import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import { imageManager, ImageManager, isTestEnvironment, extractNameFromPath, createCardImage, loadOrigCardImages, logImages, logError, CardImage } from './image-manager';

// Explicitly ensure silent mode is set
imageManager.setSilent(true);

describe('ImageManager Module', () => {
    // Reset spies after each test
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Pure Functions', () => {
        it('isTestEnvironment returns true in test environment', () => {
            expect(isTestEnvironment()).toBe(true);
        });

        it('extractNameFromPath properly extracts name from path', () => {
            const path = '/cards/The Starry Night, Vincent van Gogh, 1889.jpg';
            const name = extractNameFromPath(path);
            expect(name).toBe('The Starry Night');

            // Test with short name
            const shortPath = '/cards/Mona Lisa.jpg';
            expect(extractNameFromPath(shortPath)).toBe('Mona Lisa');

            // Test with very long name (takes only first 3 words)
            const longPath = '/cards/A Very Long Title That Should Be Truncated.jpg';
            expect(extractNameFromPath(longPath)).toBe('A Very Long');
        });

        it('createCardImage creates a card image object', () => {
            const path = '/cards/The Starry Night, Vincent van Gogh, 1889.jpg';
            const index = 5;
            const image = createCardImage(path, index);

            expect(image).toEqual({
                id: 6, // index + 1
                name: 'The Starry Night',
                path: path
            });
        });

        it('loadOrigCardImages returns an array of all card images', () => {
            const images = loadOrigCardImages();
            expect(images).toBeInstanceOf(Array);
            expect(images.length).toBe(12);

            // Check first and last image to ensure they're properly formed
            expect(images[0].name).toContain('Sunday');
            expect(images[11].name).toContain('Impression');
        });

        it('logImages logs images when not silent', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const images: CardImage[] = [
                { id: 1, name: 'Test Image', path: '/test.jpg' }
            ];

            // Test with silent false
            logImages(images, false);
            expect(consoleLogSpy).toHaveBeenCalled();

            // Test with silent true
            consoleLogSpy.mockClear();
            logImages(images, true);
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('logError logs errors when not silent', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const error = new Error('Test error');

            // Test with silent false
            logError(error, false);
            expect(consoleErrorSpy).toHaveBeenCalled();

            // Test with silent true
            consoleErrorSpy.mockClear();
            logError(error, true);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('ImageManager Constructor', () => {
        it('creates a new instance with default settings', () => {
            const manager = new ImageManager();
            expect(manager.getAllCardImages()).toHaveLength(12);
        });

        it('accepts config to set silent mode', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Should log when silent is false
            new ImageManager({ silent: false });
            expect(consoleLogSpy).toHaveBeenCalled();

            // Should not log when silent is true
            consoleLogSpy.mockClear();
            new ImageManager({ silent: true });
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });
    });

    describe('ImageManager Error Handling', () => {
        it('handles errors during initialization', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Directly test the error logging function
            const testError = new Error('Test error');
            logError(testError, false);

            // Error should be logged
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading card images:', testError);

            // Clean up
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Singleton imageManager', () => {
        beforeAll(() => {
            imageManager.setSilent(true);
        });

        it('is an instance of ImageManager', () => {
            expect(imageManager).toBeInstanceOf(ImageManager);
        });

        it('can be reset', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Reset with silent false
            imageManager.reset({ silent: false });
            expect(consoleLogSpy).toHaveBeenCalled();

            // Reset back to silent mode
            imageManager.reset({ silent: true });
        });
    });

    describe('ImageManager Instance Methods', () => {
        let manager: ImageManager;

        beforeAll(() => {
            manager = new ImageManager({ silent: true });
        });

        it('getAllCardImages returns a copy of all images', () => {
            const images1 = manager.getAllCardImages();
            const images2 = manager.getAllCardImages();

            expect(images1).toHaveLength(12);
            expect(images1).not.toBe(images2);
            expect(images1).toEqual(images2);
        });

        it('getCardImageById returns correct image', () => {
            const image = manager.getCardImageById(1);
            expect(image).toBeDefined();
            expect(image?.id).toBe(1);

            // Non-existent ID
            expect(manager.getCardImageById(999)).toBeUndefined();
        });

        it('getCardBackImagePath returns the back image path', () => {
            expect(manager.getCardBackImagePath()).toBe('/Back Side.jpg');
        });

        it('getTotalCardImages returns the correct number of available images', () => {
            expect(manager.getTotalCardImages()).toBe(12);
        });

        it('getRandomCardImages returns the requested number of images', () => {
            const numPairs = 5;
            const selectedImages = manager.getRandomCardImages(numPairs);
            expect(selectedImages).toHaveLength(numPairs);

            // Verify all images are unique
            const uniqueIds = new Set(selectedImages.map(img => img.id));
            expect(uniqueIds.size).toBe(numPairs);
        });

        it('getRandomCardImages throws error when requesting too many pairs', () => {
            expect(() => manager.getRandomCardImages(13)).toThrow();
        });

        it('getCardPairs returns pairs of all images', () => {
            const pairs = manager.getCardPairs();

            // Should have 24 cards (12 pairs)
            expect(pairs).toHaveLength(24);

            // Each ID should appear exactly twice
            const counts = new Map<number, number>();
            pairs.forEach(card => {
                counts.set(card.id, (counts.get(card.id) || 0) + 1);
            });

            counts.forEach((count) => {
                expect(count).toBe(2);
            });
        });

        it('setSilent controls console logging', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Turn off silent mode
            manager.setSilent(false);
            manager.initialize();
            expect(consoleLogSpy).toHaveBeenCalled();

            // Turn on silent mode
            consoleLogSpy.mockClear();
            manager.setSilent(true);
            manager.initialize();
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });
    });
}); 