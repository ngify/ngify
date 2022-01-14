# @ngify/store

A simple state manager based on decorator and rxjs.

[![version](https://img.shields.io/npm/v/@ngify/store/latest.svg)](https://www.npmjs.com/package/@ngify/store)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![简体中文](https://img.shields.io/static/v1?label=简体中文&message=zh-CN&color=212121)](https://github.com/ngify/ngify/blob/main/packages/store/README.zh-CN.md)

## Concept

There is a `Store` in the application that stores some global `States`.
Every state is an object. Objects have properties that are the values of this state, and objects have methods that can modify the value of the object.
<br>
By convention, only methods of the state class object can modify the state value.

## API

For the full API definition, please visit [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_store.html).

## Usage

Definition state:

```ts
import { Action, State } from '@ngify/store';

// Decorate User as a state class using the State decorator.
@State()
export class User {
  constructor(
    public name: string,
    public age: number,
    public weight: number
  ) { }

  // Decorating with the Action decorator involves methods that modify state.
  @Action()
  changeName(name: string) {
    this.name = name;
  }

  // Action decorator has an optional property (ActionName), which defaults to the method name.
  @Action()
  growUp() {
    this.age++;
  }

  // You can also customize the action name.
  @Action('lose-weight')
  loseWeight() {
    this.weight -= 5;
  }

  // When state needs to be modified asynchronously, async/await is required or a Promise/Observable is returned
  @Action()
  async asyncLoseWeight() {
    await new Promise(resolve => {
      this.weight -= 10;
      resolve();
    });
  }

  log() {
    console.log(this);
  }
}
```

Create state at the application entry point：

```ts
import { User } from './xxx';

...
new User('Jack', 15, 100);
...
```

Listen for state change:

```ts
import { store } from '@ngify/store';
import { map } from 'rxjs';
import { User } from './xxx';

store.on(User).subscribe(o => {
  console.log('User: changed', o);
});

store.on(User, 'changeName').pipe(
  map(o => o.name)
).subscribe(name => {
  console.log('User: change name', name);
});

store.on(User, 'lose-weight').subscribe(o => {
  console.log('User: weight loss success', o);
});
```

Get state object:

```ts
import { store } from '@ngify/store';
import { User } from './xxx';

const user = store.get(User);
user.changeName('Jobs');
```
