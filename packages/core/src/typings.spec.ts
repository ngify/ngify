import { PickMethod, PickProperty } from '@ngify/core'

class Cls {
  propertyA = 1
  get propertyB() { return true }
  set propertyC(_: string) { }
  methodA() { }
  methodB = () => 1
}

test('PickProperty', () => {
  expectTypeOf<PickProperty<Cls>>().toMatchTypeOf<{ propertyA: number, propertyB: boolean, propertyC: string }>()
})

test('PickMethod', () => {
  expectTypeOf<PickMethod<Cls>>().toMatchTypeOf<{ methodA(): void, methodB: () => number }>()
})
