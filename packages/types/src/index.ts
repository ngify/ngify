/** Represents a class `T` */
export interface Type<T> extends Function {
  new(...args: SafeAny[]): T;
}

/**
 * Exclude methods from `T`
 *
 * ```ts
 * Property<{ x: string, y: () => void }> -> { x: string }
 * ```
 */
export type Property<T> = Omit<T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>;

/**
 * Exclude properties from `T`
 *
 * ```ts
 * Method<{ x: string, y: () => void }> -> { y: () => void }
 * ```
 */
export type Method<T> = Omit<T, keyof Property<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;

/** Any Object */
export type AnyObject = Record<string, SafeAny>;
/** Any Array */
export type AnyArray = SafeAny[];
