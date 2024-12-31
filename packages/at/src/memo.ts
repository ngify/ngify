/**
 * A decorator that memoizes the result of a getter method.
 *
 * The first time the getter is accessed, it invokes the original method and caches the result.
 * Subsequent accesses return the cached value without invoking the method again.
 *
 * @returns A decorator function that applies the memoization logic to the target getter.
 */
export function Memo() {
  return function <This, Return>(
    target: (this: This) => Return,
    _context: ClassGetterDecoratorContext<This, Return>
  ) {
    let lastReturn: Return;
    return function (this: This): Return {
      return lastReturn ??= target.apply(this);
    };
  };
}
