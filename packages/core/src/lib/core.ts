/** Represents a class `T` */
export interface Type<T> extends Function {
  new(...args: SafeAny[]): T;
}

/**
 * Exclude methods from `T`
 *
 * ```ts
 * PickProperty<{ x: string, y: () => void }> -> { x: string }
 * ```
 */
export type PickProperty<T> = Omit<T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>;

/**
 * Exclude properties from `T`
 *
 * ```ts
 * PickMethod<{ x: string, y: () => void }> -> { y: () => void }
 * ```
 */
export type PickMethod<T> = Omit<T, keyof PickProperty<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;

/** Any Object */
export type AnyObject = Record<string | number | symbol, SafeAny>;
/** Any Array */
export type AnyArray = SafeAny[];
