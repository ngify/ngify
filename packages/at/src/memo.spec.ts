import { Memo } from '@ngify/at';

describe('Memo', () => {
  it('should be memoizes the result of a getter method', () => {
    let counter = 0;
    const obj = new class {
      @Memo()
      get value() {
        return ++counter;
      }
    }();

    expect(obj.value).toBe(1);
    expect(obj.value).toBe(1);
    expect(obj.value).toBe(1);
  });
});
