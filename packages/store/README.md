# @ngify/store

一个基于 `装饰器` 和 `rxjs` 的简易状态管理库。

## 概念

应用程序中有一个仓库（Store），存储着一些全局状态（State）。
每一个状态都是一个对象。对象拥有属性，这些属性便是这个状态的值；对象拥有方法，这些方法可以修改对象的值。按照约定，只有状态类对象的方法才可以修改状态值。

## 用法

定义状态：

```ts
import { Action, State } from '@ngify/store';

@State('user') // 使用 State 将 User 装饰为一个状态类
export class User {
  // 声明状态的属性
  constructor(
    public name: string,
    public age: number,
    public weight: number
  ) { }

  // 使用 Action 装饰涉及修改状态的方法
  @Action()
  changeName(name: stirng) {
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
import { store } from '@ngify/store';
import { map } from 'rxjs';
import { User } from './xxx';

store.on<User>(User).subscribe(o => {
  console.log('User change', o);
});

store.on<User>(User, 'changeName').pipe(
  map(o => o.name)
).subscribe(name => {
  console.log('User 改名了', name);
});

store.on<User>(User, '减肥').subscribe(o => {
  console.log('User 减肥成功', o);
});
```

在 `wepy2` 中使用：

```html
<template>
  <view>
    age: {{ user.age }} | <text @tap="change1">点我长大</text>
  </view>
  <view>
    weight: {{ user.weight }} | <text @tap="change2">点我减肥</text>
  </view>
</template>

<script>
  import wepy from '@wepy/core';
  import { User } from './xxx';
  import { WithState, store } from '@ngify/store';

  @WithState(wepy, {
    user: User
  })
  class Page {
    data = {};

    computed = {};

    methods = {
      change1() {
        this.user.growUp();
      },
      change2() {
        this.user.loseWeight();
      }
    };

    created() {
      store.on<User>(User).subscribe(o => {
        console.log('user change', o);
      });
    }
  }

  wepy.page(new Page());
</script>
```
