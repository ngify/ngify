export interface Type<T> extends Function {
  new(...args: any[]): T;
}

/** 过滤方法 */
export type Property<O extends object> = Omit<O, { [K in keyof O]: O[K] extends Function ? K : never }[keyof O]>;

/** 过滤属性 */
export type Method<O extends object> = Omit<O, keyof Property<O>>;
