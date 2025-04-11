import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DefaultTimerService, SynchronousTimerService, TimerService } from './timer-service';

describe('TimerService', () => {
    describe('DefaultTimerService', () => {
        let timerService: TimerService;
        let originalSetTimeout: typeof window.setTimeout;
        let originalClearTimeout: typeof window.clearTimeout;
        let mockSetTimeoutCalls: Array<[Function, number]> = [];
        let lastTimeoutId = 0;

        beforeEach(() => {
            mockSetTimeoutCalls = [];
            lastTimeoutId = 0;

            // Save original functions
            originalSetTimeout = window.setTimeout;
            originalClearTimeout = window.clearTimeout;

            // Replace window functions to track calls without using mocks
            window.setTimeout = ((callback: Function, delay: number) => {
                mockSetTimeoutCalls.push([callback, delay]);
                return ++lastTimeoutId;
            }) as typeof window.setTimeout;

            window.clearTimeout = vi.fn();

            timerService = new DefaultTimerService();
        });

        afterEach(() => {
            // Restore original functions
            window.setTimeout = originalSetTimeout;
            window.clearTimeout = originalClearTimeout;
        });

        it('should call window.setTimeout with the provided callback and delay', () => {
            const callback = vi.fn();
            const delay = 1000;

            timerService.setTimeout(callback, delay);

            expect(mockSetTimeoutCalls.length).toBe(1);
            expect(mockSetTimeoutCalls[0][0]).toBe(callback);
            expect(mockSetTimeoutCalls[0][1]).toBe(delay);
        });

        it('should return the timeout ID from window.setTimeout', () => {
            const callback = vi.fn();
            const timeoutId = timerService.setTimeout(callback, 1000);

            expect(timeoutId).toBe(1);
        });

        it('should call window.clearTimeout with the provided timeout ID', () => {
            const timeoutId = 123;

            timerService.clearTimeout(timeoutId);

            expect(window.clearTimeout).toHaveBeenCalledWith(timeoutId);
        });
    });

    describe('SynchronousTimerService', () => {
        let timerService: TimerService;

        beforeEach(() => {
            timerService = new SynchronousTimerService();
        });

        it('should execute the callback immediately', () => {
            const callback = vi.fn();

            timerService.setTimeout(callback, 1000);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should return a dummy ID', () => {
            const callback = vi.fn();
            const timeoutId = timerService.setTimeout(callback, 1000);

            expect(timeoutId).toBe(1);
        });

        it('should do nothing when clearTimeout is called', () => {
            // This test just verifies that calling clearTimeout doesn't throw an error
            expect(() => {
                timerService.clearTimeout(123);
            }).not.toThrow();
        });
    });
}); 