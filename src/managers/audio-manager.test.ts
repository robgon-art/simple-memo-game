import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import { audioManager, AudioManager, isTestEnvironment, loadAudioEffects, logAudio, logError, AudioEffect } from './audio-manager';

// Explicitly ensure silent mode is set
audioManager.setSilent(true);

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
            manager = new AudioManager({ silent: true });
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
            });

            // @ts-ignore - replacing private property for testing
            manager['audioElements'] = mockMap;

            expect(manager.playEffect('cardFlip')).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('playEffect accepts volume parameter', () => {
            manager.setSilent(false);

            // Create mock for Audio implementation
            const mockPlay = vi.fn();
            const mockCloneNode = vi.fn(() => ({
                play: mockPlay,
                volume: 0
            }));

            const mockMap = new Map();
            mockMap.set('cardFlip', {
                cloneNode: mockCloneNode
            });

            // @ts-ignore - replacing private property for testing
            manager['audioElements'] = mockMap;

            // Test with volume 0.5
            expect(manager.playEffect('cardFlip', 0.5)).toBe(true);
            expect(mockCloneNode).toHaveBeenCalled();
            expect(mockPlay).toHaveBeenCalled();
        });
    });
}); 