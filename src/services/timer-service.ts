export interface TimerService {
    setTimeout(callback: () => void, delay: number): number;
    clearTimeout(timerId: number): void;
}

export class DefaultTimerService implements TimerService {
    setTimeout(callback: () => void, delay: number): number {
        return window.setTimeout(callback, delay);
    }

    clearTimeout(timerId: number): void {
        window.clearTimeout(timerId);
    }
}

// A timer service for testing that executes callbacks immediately
export class SynchronousTimerService implements TimerService {
    setTimeout(callback: () => void, _delay: number): number {
        callback();
        return 1; // Return a dummy ID
    }

    clearTimeout(_timerId: number): void {
        // Do nothing
    }
}

// Create default instance
export const defaultTimerService = new DefaultTimerService(); 