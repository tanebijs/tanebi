/**
 * Lock a property of an object.
 */
export function lock(obj: object, prop: string) {
    Reflect.defineProperty(obj, prop, {
        configurable: false,
        enumerable: false,
        writable: false,
    });
}

/**
 * Hide a property of an object.
 */
export function hide(obj: object, prop: string) {
    Reflect.defineProperty(obj, prop, {
        configurable: false,
        enumerable: false,
        writable: true,
    });
}