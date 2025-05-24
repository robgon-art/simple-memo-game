import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import { audioManager, AudioManager, isTestEnvironment, loadAudioEffects, logAudio, logError, AudioEffect, AudioElement } from './audio-manager';

// Explicitly ensure silent mode is set
audioManager.setSilent(true);

// Create a test audio element that can be used for testing without browser APIs
class TestAudioElement implements AudioElement {
    public preload: string = '';
    public volume: number = 1.0;
    public currentTime: number = 0;
    public path: string;
    public isPlaying: boolean = false;
    public isPaused: boolean = false;
    private eventListeners: Map<string, Set<EventListenerOrEventListenerObject>> = new Map();

    constructor(path: string) {
        this.path = path;
    }

    play(): void {
        this.isPlaying = true;
        this.isPaused = false;
        this.triggerEvent('play');
    }

    pause(): void {
        this.isPlaying = false;
        this.isPaused = true;
        this.triggerEvent('pause');
    }

    cloneNode(): AudioElement {
        const clone = new TestAudioElement(this.path);
        clone.volume = this.volume;
        return clone;
    }

    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, new Set());
        }
        this.eventListeners.get(type)?.add(listener);
    }

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
        this.eventListeners.get(type)?.delete(listener);
    }

    private triggerEvent(type: string): void {
        this.eventListeners.get(type)?.forEach(listener => {
            if (typeof listener === 'function') {
                listener(new Event(type));
            }
        });
    }
}

// Create a factory for test audio elements
const createTestAudio = (path: string): AudioElement => new TestAudioElement(path);

describe('AudioManager Module', () => {
    // Reset spies after each test
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Pure Functions', () => {
        it('isTestEnvironment returns true in test environment', () => {
            expect(isTestEnvironment()).toBe(true);
        });

        it('loadAudioEffects returns an array of all audio effects', () => {
            const effects = loadAudioEffects();
            expect(effects).toBeInstanceOf(Array);
            expect(effects.length).toBeGreaterThan(0);

            // Check that cardFlip effect exists
            const cardFlipEffect = effects.find(effect => effect.id === 'cardFlip');
            expect(cardFlipEffect).toBeDefined();
            expect(cardFlipEffect?.path).toBe('/Card Flip.wav');
        });

        it('logAudio logs effects when not silent', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const effects: AudioEffect[] = [
                { id: 'test', path: '/test.wav' }
            ];

            // Test with silent false
            logAudio(effects, false);
            expect(consoleLogSpy).toHaveBeenCalled();

            // Test with silent true
            consoleLogSpy.mockClear();
            logAudio(effects, true);
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

    describe('AudioManager Constructor', () => {
        it('creates a new instance with default settings', () => {
            const manager = new AudioManager();
            expect(manager.getAllAudioEffects().length).toBeGreaterThan(0);
        });

        it('accepts config to set silent mode', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Should log when silent is false
            new AudioManager({ silent: false });
            expect(consoleLogSpy).toHaveBeenCalled();

            // Should not log when silent is true
            consoleLogSpy.mockClear();
            new AudioManager({ silent: true });
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('accepts a custom audio factory', () => {
            const audioFactorySpy = vi.fn().mockImplementation((path: string): AudioElement => createTestAudio(path));

            // Create the manager and verify it's properly initialized
            const manager = new AudioManager({
                silent: true,
                audioFactory: audioFactorySpy
            });

            // Verify the manager is created with the correct properties
            expect(manager).toBeInstanceOf(AudioManager);
            expect(manager.getAllAudioEffects().length).toBeGreaterThan(0);

            // Initialize should call the factory for each effect
            expect(audioFactorySpy).toHaveBeenCalled();
            expect(audioFactorySpy.mock.calls.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Singleton audioManager', () => {
        beforeAll(() => {
            audioManager.setSilent(true);
        });

        it('is an instance of AudioManager', () => {
            expect(audioManager).toBeInstanceOf(AudioManager);
        });

        it('can be reset', () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Reset with silent false
            audioManager.reset({ silent: false });
            expect(consoleLogSpy).toHaveBeenCalled();

            // Reset back to silent mode
            audioManager.reset({ silent: true });
        });
    });

    describe('AudioManager Instance Methods', () => {
        let manager: AudioManager;

        beforeAll(() => {
            manager = new AudioManager({
                silent: true,
                audioFactory: createTestAudio
            });
        });

        it('getAllAudioEffects returns a copy of all effects', () => {
            const effects1 = manager.getAllAudioEffects();
            const effects2 = manager.getAllAudioEffects();

            expect(effects1.length).toBeGreaterThan(0);
            expect(effects1).not.toBe(effects2);
            expect(effects1).toEqual(effects2);
        });

        it('getAudioEffectById returns correct effect', () => {
            const effect = manager.getAudioEffectById('cardFlip');
            expect(effect).toBeDefined();
            expect(effect?.id).toBe('cardFlip');

            // Non-existent ID
            expect(manager.getAudioEffectById('nonexistent')).toBeUndefined();
        });

        it('setSilent controls sound playback', () => {
            // Start with silent true
            manager.setSilent(true);

            // Should return false when silent
            expect(manager.playEffect('cardFlip')).toBe(false);
        });

        it('playEffect returns false when audio element not found', () => {
            // Even with silent false, should return false for non-existent ID
            manager.setSilent(false);
            expect(manager.playEffect('nonexistent')).toBe(false);
        });

        it('playEffect handles errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            manager.setSilent(false);

            // Mock the Audio Map to throw an error
            const mockMap = new Map();
            mockMap.set('cardFlip', {
                cloneNode: () => { throw new Error('Test error'); }
            } as unknown as AudioElement);

            // @ts-ignore - replacing private property for testing
            manager['audioElements'] = mockMap;

            expect(manager.playEffect('cardFlip')).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('playEffect accepts volume parameter', () => {
            // Create a fresh manager with our TestAudioElement
            const testManager = new AudioManager({
                silent: false,
                audioFactory: createTestAudio
            });

            // Reset to ensure we have a clean state
            testManager.reset({
                silent: false,
                audioFactory: createTestAudio
            });

            // Play effect with volume 0.5
            const result = testManager.playEffect('cardFlip', 0.5);
            expect(result).toBe(true);
        });

        it('playMusic plays the background music', () => {
            // Create a fresh manager with our TestAudioElement
            const testManager = new AudioManager({
                silent: false,
                audioFactory: createTestAudio
            });

            // Reset to ensure we have a clean state
            testManager.reset({
                silent: false,
                audioFactory: createTestAudio
            });

            // Play music with volume 0.8
            const result = testManager.playMusic('gameComplete', 0.8);
            expect(result).toBe(true);

            // Verify background music is set correctly
            // @ts-ignore - accessing private field for testing
            const backgroundMusic = testManager['backgroundMusic'] as TestAudioElement;
            expect(backgroundMusic).toBeDefined();
            expect(backgroundMusic.isPlaying).toBe(true);
            expect(backgroundMusic.volume).toBe(0.8);
        });

        it('playMusic stops any previously playing music', () => {
            // Create a fresh manager with our TestAudioElement
            const testManager = new AudioManager({
                silent: false,
                audioFactory: createTestAudio
            });

            // Play first track
            testManager.playMusic('cardFlip');

            // Keep a reference to the first background music
            // @ts-ignore - accessing private field for testing
            const firstMusic = testManager['backgroundMusic'];

            // Spy on the stopMusic method
            const stopMusicSpy = vi.spyOn(testManager, 'stopMusic');

            // Play second track
            testManager.playMusic('gameComplete');

            // Verify stopMusic was called
            expect(stopMusicSpy).toHaveBeenCalled();

            // Verify first music was replaced
            // @ts-ignore - accessing private field for testing
            const secondMusic = testManager['backgroundMusic'];
            expect(secondMusic).not.toBe(firstMusic);
        });

        it('playMusic returns false when in silent mode', () => {
            // Create a fresh manager with silent mode
            const testManager = new AudioManager({
                silent: true,
                audioFactory: createTestAudio
            });

            // Try to play music
            const result = testManager.playMusic('gameComplete');
            expect(result).toBe(false);

            // Verify no background music was set
            // @ts-ignore - accessing private field for testing
            expect(testManager['backgroundMusic']).toBeNull();
        });

        it('playMusic returns false when effect not found', () => {
            // Create a fresh manager
            const testManager = new AudioManager({
                silent: false,
                audioFactory: createTestAudio
            });

            // Try to play non-existent music
            const result = testManager.playMusic('nonexistent');
            expect(result).toBe(false);
        });

        it('playMusic handles errors gracefully', () => {
            // Create a fresh manager
            const testManager = new AudioManager({
                silent: false,
                audioFactory: () => { throw new Error('Test error'); }
            });

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Try to play music with a failing factory
            const result = testManager.playMusic('gameComplete');
            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('stopMusic stops and resets background music', () => {
            // Create a fresh manager with our TestAudioElement
            const testManager = new AudioManager({
                silent: false,
                audioFactory: createTestAudio
            });

            // Play some music first
            testManager.playMusic('gameComplete');

            // Keep a reference to the background music
            // @ts-ignore - accessing private field for testing
            const music = testManager['backgroundMusic'] as TestAudioElement;
            expect(music.isPlaying).toBe(true);

            // Stop the music
            testManager.stopMusic();

            // Verify the music was paused and reset
            expect(music.isPaused).toBe(true);
            expect(music.currentTime).toBe(0);

            // Verify background music reference was cleared
            // @ts-ignore - accessing private field for testing
            expect(testManager['backgroundMusic']).toBeNull();
        });

        it('stopMusic does nothing when no music is playing', () => {
            // Create a fresh manager with our TestAudioElement
            const testManager = new AudioManager({
                silent: false,
                audioFactory: createTestAudio
            });

            // @ts-ignore - accessing private field for testing
            expect(testManager['backgroundMusic']).toBeNull();

            // Should not throw error when no music is playing
            expect(() => testManager.stopMusic()).not.toThrow();
        });
    });
}); 