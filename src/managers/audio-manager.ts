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
}

// Pure function to detect test environment
export const isTestEnvironment = (): boolean =>
    typeof process !== 'undefined' ||
    (typeof window !== 'undefined' && typeof (window as any).__vitest__ !== 'undefined');

// Pure function to load audio effects
export const loadAudioEffects = (): AudioEffect[] => {
    // In Vite, assets in the public directory are referenced directly by URL
    return [
        { id: 'cardFlip', path: '/Card Flip.wav' },
        { id: 'match', path: '/Match Sound.wav' }
    ];
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
    private audioElements: Map<string, HTMLAudioElement> = new Map();
    private silent: boolean;

    constructor(config?: Partial<AudioManagerConfig>) {
        this.silent = config?.silent ?? isTestEnvironment();
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

        this.audioEffects.forEach(effect => {
            const audio = new Audio(effect.path);
            audio.preload = 'auto';
            this.audioElements.set(effect.id, audio);
        });
    }

    /**
     * Reset the audio manager (useful for testing)
     */
    public reset(config?: Partial<AudioManagerConfig>): void {
        if (config?.silent !== undefined) {
            this.silent = config.silent;
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
            const clonedAudio = audioElement.cloneNode() as HTMLAudioElement;
            clonedAudio.volume = Math.max(0, Math.min(1, volume));
            clonedAudio.play();
            return true;
        } catch (error) {
            logError(error, this.silent);
            return false;
        }
    }
}

// Export an instance of the AudioManager for backward compatibility
export const audioManager = new AudioManager();
export default audioManager; 