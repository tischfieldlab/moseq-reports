/**
 * A function that emits a side effect and does not return anything.
 */
export type Procedure = (...args: Array<any>) => void;

export interface DebounceOptions {
    isImmediate: boolean;
}

export function debounce<F extends Procedure>(
    func: F,
    waitMilliseconds = 50,
    options: DebounceOptions = {
        isImmediate: false,
    },
  ): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
        const context = this;

        const doLater = () => {
            timeoutId = undefined;
            if (!options.isImmediate) {
                func.apply(context, args);
            }
        };

        const shouldCallNow = options.isImmediate && timeoutId === undefined;

        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(doLater, waitMilliseconds);

        if (shouldCallNow) {
            func.apply(context, args);
        }
    };
}

export function throttle<F extends Procedure>(func: F, limit: number) {
    let inThrottle: boolean;

    return function(this: ThisParameterType<F>, ...args: Parameters<F>): void {
        const context = this;

        if (!inThrottle) {
            inThrottle = true;
            func.apply(context, args);
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
