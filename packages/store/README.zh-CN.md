# @ngify/store

[![version](https://img.shields.io/npm/v/@ngify/store/latest.svg)](https://www.npmjs.com/package/@ngify/store)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)
[![English](https://img.shields.io/static/v1?label=English&message=en-US&color=212121)](https://github.com/ngify/ngify/blob/main/packages/store/README.md)

一个基于 `装饰器` 和 `rxjs` 的简易状态管理器。

## 概念

应用程序中有一个仓库（Store），存储着一些全局状态（State）。
每一个状态都是一个对象。对象拥有属性，这些属性便是这个状态的值；对象拥有方法，这些方法可以修改对象的值。
<br>
按照约定，只有状态类对象的方法才可以修改状态值。

## API

有关完整的 API 定义，请访问 [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_store.html)。

## 安装

```bash
npm i @ngify/store
```

## 用法

定义状态：

```ts
import { Action, State } from '@ngify/store';

// 使用 State 将 User 装饰为一个状态类
@State()
export class User {
  constructor(
    public name: string,
    public age: number,
    public weight: number
  ) { }

  // 使用 Action 装饰涉及修改状态的方法
  @Action()
  changeName(name: string) {
    this.name = name;
  }

  // Action 有一个可选属性（Action Name），默认为方法名
  @Action()
  growUp() {
    this.age++;
  }

  // 可以自己定义 Action Name
  @Action('减肥')
  loseWeight() {
    this.weight -= 5;
  }

  // 当需要异步修改状态时，需要使用 async/await 或者返回一个 Promise / Observable
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

在应用程序入口处创建状态：

```ts
import { User } from './xxx';

...
new User('小明', 15, 100);
...
```

侦听状态变更：

```ts
import { getStore } from '@ngify/store';
import { map } from 'rxjs';
import { User } from './xxx';

const store = getStore();

store.on(User).subscribe(o => {
  console.log('User：变更了', o);
});

store.on(User, 'changeName').pipe(
  map(o => o.name)
).subscribe(name => {
  console.log('User：改名了', name);
});

store.on(User, '减肥').subscribe(o => {
  console.log('User：减肥成功', o);
});
```

获取状态对象：

```ts
import { getStore } from '@ngify/store';
import { User } from './xxx';

const user = getStore().get(User);
user.changeName('小红');
```
