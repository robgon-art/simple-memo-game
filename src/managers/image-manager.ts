/**
 * Image Manager
 * Responsible for loading and managing card images for the memory game
 */

// Define interfaces
interface CardImage {
    id: number;
    name: string;
    path: string;
}

// Detect if we're in a test environment (either Node.js or via Vitest)
const isTestEnvironment = typeof process !== 'undefined' || 
                         (typeof window !== 'undefined' && 
                          typeof (window as any).__vitest__ !== 'undefined');

class ImageManager {
    private cardImages: CardImage[] = [];
    private backImagePath: string = '/Back Side.jpg';
    private silent: boolean = isTestEnvironment; // Start silent if in test environment

    constructor(silent?: boolean) {
        if (silent !== undefined) {
            this.silent = silent;
        }
        this.loadCardImages();
    }

    /**
     * Load all card images from the public/cards directory
     */
    private loadCardImages(): void {
        try {
            // In Vite, assets in the public directory are referenced directly by URL
            // Since we can't use import.meta.glob on public directory, we'll use our knowledge
            // of the existing files in the public/cards directory

            const cardPaths = [
                '/cards/A Sunday Afternoon on the Island of La Grande Jatte, Georges Seurat, 1884.jpg',
                '/cards/Mont Sainte-Victoire, Paul Cézanne, c. 1890s.jpg',
                '/cards/Jeanne Samary in a Low-Necked Dress, Pierre-Auguste Renoir, 1877.jpg',
                '/cards/Children Playing on the Beach, Mary Cassatt, 1884.jpg',
                '/cards/The Green Line, Henri Matisse, 1905.jpg',
                '/cards/The Starry Night, Vincent van Gogh, 1889.jpg',
                '/cards/Le Déjeuner sur l\'herbe, Édouard Manet, 1863.jpg',
                '/cards/Dance at Bougival, Pierre-Auguste Renoir, 1883.jpg',
                '/cards/The Ballet Class, Edgar Degas, 1873.jpg',
                '/cards/Boulevard Montmartre, Spring, Camille Pissarro, 1897.jpg',
                '/cards/At the Moulin Rouge - The Dance, Henri de Toulouse-Lautrec, 1890.jpg',
                '/cards/Impression Sunrise, Claude Monet, 1872.jpg'
            ];

            // Convert the paths to CardImage objects
            this.cardImages = cardPaths.map((path, index) => {
                // Extract filename from path
                const filename = path.split('/').pop() || '';

                // Remove file extension and artist info for a cleaner name
                const nameParts = filename.split(',')[0].trim().split(' ');

                // Use first few words as the name to keep it short
                const name = nameParts.slice(0, Math.min(3, nameParts.length)).join(' ');

                return {
                    id: index + 1,
                    name: name,
                    path: path
                };
            });

            // Print images to debug console as requested (unless in silent mode)
            if (!this.silent) {
                console.log('Loaded card images:');
                this.cardImages.forEach(image => {
                    console.log(`${image.id}: ${image.name} - ${image.path}`);
                });
            }
        } catch (error) {
            // Only log errors in non-silent mode
            if (!this.silent) {
                console.error('Error loading card images:', error);
            }
        }
    }

    /**
     * Set silent mode (to disable console logging)
     */
    public setSilent(silent: boolean): void {
        this.silent = silent;
    }

    /**
     * Get all card images
     */
    public getAllCardImages(): CardImage[] {
        return [...this.cardImages];
    }

    /**
     * Get a card image by ID
     */
    public getCardImageById(id: number): CardImage | undefined {
        return this.cardImages.find(image => image.id === id);
    }

    /**
     * Get the path to the card back image
     */
    public getCardBackImagePath(): string {
        return this.backImagePath;
    }

    /**
     * Get a pair of all card images for the memory game (24 cards total)
     * Each card appears twice in the returned array
     */
    public getCardPairs(): CardImage[] {
        // Create a pair of each card
        const pairs: CardImage[] = [];
        this.cardImages.forEach(image => {
            // Add each image twice (for pairs)
            pairs.push({ ...image });
            pairs.push({ ...image });
        });
        return pairs;
    }
}

// Export an instance of the ImageManager
export const imageManager = new ImageManager();
export default imageManager; 