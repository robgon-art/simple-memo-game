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
    cardStyle?: 'impressionist' | 'robgon';
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

// Pure function to load original card images
export const loadOrigCardImages = (): CardImage[] => {
    // In Vite, assets in the public directory are referenced directly by URL
    const cardPaths = [
        import.meta.env.BASE_URL + 'cards/A Sunday Afternoon on the Island of La Grande Jatte, Georges Seurat, 1884.jpg',
        import.meta.env.BASE_URL + 'cards/Mont Sainte-Victoire, Paul Cézanne, c. 1890s.jpg',
        import.meta.env.BASE_URL + 'cards/Jeanne Samary in a Low-Necked Dress, Pierre-Auguste Renoir, 1877.jpg',
        import.meta.env.BASE_URL + 'cards/Children Playing on the Beach, Mary Cassatt, 1884.jpg',
        import.meta.env.BASE_URL + 'cards/The Green Line, Henri Matisse, 1905.jpg',
        import.meta.env.BASE_URL + 'cards/The Starry Night, Vincent van Gogh, 1889.jpg',
        import.meta.env.BASE_URL + 'cards/Le Déjeuner sur l\'herbe, Édouard Manet, 1863.jpg',
        import.meta.env.BASE_URL + 'cards/Dance at Bougival, Pierre-Auguste Renoir, 1883.jpg',
        import.meta.env.BASE_URL + 'cards/The Ballet Class, Edgar Degas, 1873.jpg',
        import.meta.env.BASE_URL + 'cards/Boulevard Montmartre, Spring, Camille Pissarro, 1897.jpg',
        import.meta.env.BASE_URL + 'cards/At the Moulin Rouge - The Dance, Henri de Toulouse-Lautrec, 1890.jpg',
        import.meta.env.BASE_URL + 'cards/Impression Sunrise, Claude Monet, 1872.jpg'
    ];

    // Convert the paths to CardImage objects using pure function
    return cardPaths.map(createCardImage);
};

// Pure function to load Rob's card images
export const loadRobsCardImages = (): CardImage[] => {
    const cardPaths = [
        import.meta.env.BASE_URL + 'rob_cards/pop pug.jpg',
        import.meta.env.BASE_URL + 'rob_cards/pop greyhound.jpg',
        import.meta.env.BASE_URL + 'rob_cards/pop corgi.jpg',
        import.meta.env.BASE_URL + 'rob_cards/pop amstaff.jpg',
        import.meta.env.BASE_URL + 'rob_cards/blue lady 1.jpg',
        import.meta.env.BASE_URL + 'rob_cards/blue lady 2.jpg',
        import.meta.env.BASE_URL + 'rob_cards/blue lady 3.jpg',
        import.meta.env.BASE_URL + 'rob_cards/blue lady 4.jpg',
        import.meta.env.BASE_URL + 'rob_cards/dow explore loch ness.jpg',
        import.meta.env.BASE_URL + 'rob_cards/dow escape to mars.jpg',
        import.meta.env.BASE_URL + 'rob_cards/dow discover roswell.jpg',
        import.meta.env.BASE_URL + 'rob_cards/dow atlantis awaits.jpg'
    ];

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
    private backImagePath: string = import.meta.env.BASE_URL + 'Back Side.jpg';
    private silent: boolean;
    private cardStyle: 'impressionist' | 'robgon';

    constructor(config?: Partial<ImageManagerConfig>) {
        this.silent = config?.silent ?? isTestEnvironment();
        this.cardStyle = config?.cardStyle ?? 'robgon';
        this.initialize();
    }

    /**
     * Initialize the image manager
     */
    public initialize(): void {
        try {
            this.cardImages = this.cardStyle === 'impressionist' ? loadOrigCardImages() : loadRobsCardImages();
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
     * Set the card style and reload images
     */
    public setCardStyle(style: 'impressionist' | 'robgon'): void {
        if (this.cardStyle !== style) {
            this.cardStyle = style;
            this.initialize();
        }
    }

    /**
     * Get the current card style
     */
    public getCardStyle(): 'impressionist' | 'robgon' {
        return this.cardStyle;
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
     * Get the total number of available card images
     * @returns The total number of unique card images available
     */
    public getTotalCardImages(): number {
        return this.cardImages.length;
    }

    /**
     * Get a random selection of card images
     * @param numPairs Number of pairs to select
     * @returns Array of randomly selected card images
     * @throws Error if numPairs exceeds available images
     */
    public getRandomCardImages(numPairs: number): CardImage[] {
        if (numPairs > this.cardImages.length) {
            throw new Error(`Cannot select ${numPairs} pairs: only ${this.cardImages.length} images available`);
        }

        // Create a copy of all images and shuffle them
        const shuffledImages = [...this.cardImages].sort(() => Math.random() - 0.5);

        // Take the first numPairs images
        return shuffledImages.slice(0, numPairs);
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