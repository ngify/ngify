/** Represents a class `T` */
export interface Type<T> extends Function {
  new(...args: any[]): T;
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
