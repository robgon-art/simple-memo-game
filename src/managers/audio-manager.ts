/**
 * Audio Manager
 * Responsible for loading and playing audio effects for the memory game
 */

// Define interfaces
export interface AudioEffect {
    id: string;
    path: string;
}

// Configuration options
export interface AudioManagerConfig {
    silent: boolean;
    audioFactory?: (path: string) => AudioElement;
}

// Audio element interface for testing purposes
export interface AudioElement {
    preload: string;
    volume: number;
    currentTime: number;
    play: () => Promise<void> | void;
    pause: () => void;
    cloneNode: () => AudioElement;
}

// Pure function to detect test environment
export const isTestEnvironment = (): boolean =>
    typeof process !== 'undefined' ||
    (typeof window !== 'undefined' && typeof (window as any).__vitest__ !== 'undefined');

// Pure function to load audio effects
export const loadAudioEffects = (): AudioEffect[] => {
    // In Vite, assets in the public directory are referenced directly by URL
    return [
        { id: 'cardFlip', path: import.meta.env.BASE_URL + 'Card Flip.wav' },
        { id: 'match', path: import.meta.env.BASE_URL + 'Match Sound.wav' },
        { id: 'gameComplete', path: import.meta.env.BASE_URL + 'Campaign Horse.mp3' }
    ];
};

// Default audio factory
export const createAudio = (path: string): AudioElement => {
    const audio = new Audio(path);
    return audio as unknown as AudioElement;
};

// Side effect: logging function
export const logAudio = (audio: AudioEffect[], silent: boolean): void => {
    if (silent) return;

    console.log('Loaded audio effects:');
    audio.forEach(effect => {
        console.log(`${effect.id}: ${effect.path}`);
    });
};

// Side effect: error logging function
export const logError = (error: unknown, silent: boolean): void => {
    if (silent) return;
    console.error('Error loading audio effects:', error);
};

/**
 * AudioManager class with improved testability
 */
export class AudioManager {
    private audioEffects: AudioEffect[] = [];
    private audioElements: Map<string, AudioElement> = new Map();
    private silent: boolean;
    private backgroundMusic: AudioElement | null = null;
    private audioFactory: (path: string) => AudioElement;

    constructor(config?: Partial<AudioManagerConfig>) {
        this.silent = config?.silent ?? isTestEnvironment();
        this.audioFactory = config?.audioFactory ?? createAudio;
        this.initialize();
    }

    /**
     * Initialize the audio manager
     */
    public initialize(): void {
        try {
            this.audioEffects = loadAudioEffects();
            this.preloadAudio();
            logAudio(this.audioEffects, this.silent);
        } catch (error) {
            logError(error, this.silent);
        }
    }

    /**
     * Preload audio files for faster playback
     */
    private preloadAudio(): void {
        if (typeof window === 'undefined') return; // Skip in non-browser environments

        this.audioElements.clear();
        this.audioEffects.forEach(effect => {
            try {
                const audio = this.audioFactory(effect.path);
                audio.preload = 'auto';
                this.audioElements.set(effect.id, audio);
            } catch (error) {
                logError(error, this.silent);
            }
        });
    }

    /**
     * Reset the audio manager (useful for testing)
     */
    public reset(config?: Partial<AudioManagerConfig>): void {
        if (config?.silent !== undefined) {
            this.silent = config.silent;
        }
        if (config?.audioFactory !== undefined) {
            this.audioFactory = config.audioFactory;
        }
        this.initialize();
    }

    /**
     * Set silent mode (to disable sounds)
     */
    public setSilent(silent: boolean): void {
        this.silent = silent;
    }

    /**
     * Get all audio effects
     */
    public getAllAudioEffects(): AudioEffect[] {
        return [...this.audioEffects];
    }

    /**
     * Get an audio effect by ID
     */
    public getAudioEffectById(id: string): AudioEffect | undefined {
        return this.audioEffects.find(effect => effect.id === id);
    }

    /**
     * Play an audio effect by ID
     * @returns true if played successfully, false otherwise
     */
    public playEffect(id: string, volume: number = 1.0): boolean {
        if (this.silent) return false;
        if (typeof window === 'undefined') return false;

        try {
            const audioElement = this.audioElements.get(id);
            if (!audioElement) return false;

            // Clone the audio element to allow overlapping sounds
            const clonedAudio = audioElement.cloneNode() as AudioElement;
            clonedAudio.volume = Math.max(0, Math.min(1, volume));
            clonedAudio.play();
            return true;
        } catch (error) {
            logError(error, this.silent);
            return false;
        }
    }

    /**
     * Play background music by ID
     * @returns true if played successfully, false otherwise
     */
    public playMusic(id: string, volume: number = 0.7): boolean {
        if (this.silent) return false;
        if (typeof window === 'undefined') return false;

        try {
            // Stop any currently playing music
            this.stopMusic();

            const effect = this.getAudioEffectById(id);
            if (!effect) return false;

            // Create a new audio element for the music
            this.backgroundMusic = this.audioFactory(effect.path);
            this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
            this.backgroundMusic.play();
            return true;
        } catch (error) {
            logError(error, this.silent);
            return false;
        }
    }

    /**
     * Stop any currently playing background music
     */
    public stopMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
        }
    }
}

// Export an instance of the AudioManager for backward compatibility
export const audioManager = new AudioManager();
export default audioManager; 