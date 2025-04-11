/**
 * Image Manager
 * Responsible for loading and managing card images for the memory game
 */

// Define interfaces
export interface CardImage {
    id: number;
    name: string;
    path: string;
}

// Configuration options
export interface ImageManagerConfig {
    silent: boolean;
}

// Pure function to detect test environment
export const isTestEnvironment = (): boolean =>
    typeof process !== 'undefined' ||
    (typeof window !== 'undefined' && typeof (window as any).__vitest__ !== 'undefined');

// Pure function to extract name from image path
export const extractNameFromPath = (path: string): string => {
    const filename = path.split('/').pop() || '';
    
    // Remove file extension first
    const nameWithoutExtension = filename.replace(/\.[^.]+$/, '');
    
    // Then split by comma and take the first part
    const nameParts = nameWithoutExtension.split(',')[0].trim().split(' ');
    return nameParts.slice(0, Math.min(3, nameParts.length)).join(' ');
};

// Pure function to create a card image
export const createCardImage = (path: string, index: number): CardImage => ({
    id: index + 1,
    name: extractNameFromPath(path),
    path
});

// Pure function to load card images
export const loadCardImages = (): CardImage[] => {
    // In Vite, assets in the public directory are referenced directly by URL
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

    // Convert the paths to CardImage objects using pure function
    return cardPaths.map(createCardImage);
};

// Side effect: logging function
export const logImages = (images: CardImage[], silent: boolean): void => {
    if (silent) return;

    console.log('Loaded card images:');
    images.forEach(image => {
        console.log(`${image.id}: ${image.name} - ${image.path}`);
    });
};

// Side effect: error logging function
export const logError = (error: unknown, silent: boolean): void => {
    if (silent) return;
    console.error('Error loading card images:', error);
};

/**
 * ImageManager class with improved testability
 */
export class ImageManager {
    private cardImages: CardImage[] = [];
    private backImagePath: string = '/Back Side.jpg';
    private silent: boolean;

    constructor(config?: Partial<ImageManagerConfig>) {
        this.silent = config?.silent ?? isTestEnvironment();
        this.initialize();
    }

    /**
     * Initialize the image manager
     */
    public initialize(): void {
        try {
            this.cardImages = loadCardImages();
            logImages(this.cardImages, this.silent);
        } catch (error) {
            logError(error, this.silent);
        }
    }

    /**
     * Reset the image manager (useful for testing)
     */
    public reset(config?: Partial<ImageManagerConfig>): void {
        if (config?.silent !== undefined) {
            this.silent = config.silent;
        }
        this.initialize();
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
        // Create a pair of each card using a functional approach
        return this.cardImages.flatMap(image => [{ ...image }, { ...image }]);
    }
}

// Export an instance of the ImageManager for backward compatibility
export const imageManager = new ImageManager();
export default imageManager; 