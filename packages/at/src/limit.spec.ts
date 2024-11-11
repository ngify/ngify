import { Limit, Once } from '@ngify/at';

describe('Limit', () => {
  it('multi', () => {
    const obj = new class {
      @Limit(2)
      limit(value: number) {
        return value;
      }
    }();

    let result = obj.limit(1);
    result = obj.limit(2);
    result = obj.limit(3);

    expect(result).toBe(2);
  });

  it('once', () => {
    const obj = new class {
      @Once()
      once(value: number) {
        return value;
      }
    }();

    let result = obj.once(1);
    result = obj.once(2);

    expect(result).toBe(1);
  });
});
