import { Action, State, getStore } from '@ngify/store';
import { Observable, take } from 'rxjs';

describe('Index', () => {
  @State()
  class A {
    value: string = 'initial value of a';

    @Action('custom')
    action(value: string) {
      this.value = value;
    }

    @Action()
    sync(value: string) {
      this.value = value;
    }

    @Action()
    async async(value: string) {
      await new Promise(resolve => {
        resolve(this.value = value);
      });
    }

    @Action()
    promise(value: string) {
      return new Promise(resolve => {
        resolve(this.value = value);
      });
    }

    @Action()
    observable(value: string) {
      return new Observable(subscriber => {
        subscriber.next(this.value = value);
        subscriber.complete();
      });
    }
  }

  @State()
  class B {
    value: string = 'initial value of b';

    @Action('custom')
    action(value: string) {
      this.value = value;
    }

    @Action()
    sync(value: string) {
      this.value = value;
    }

    @Action()
    async async(value: string) {
      await new Promise(resolve => {
        resolve(this.value = value);
      });
    }

    @Action()
    promise(value: string) {
      return new Promise(resolve => {
        resolve(this.value = value);
      });
    }

    @Action()
    observable(value: string) {
      return new Observable(subscriber => {
        subscriber.next(this.value = value);
        subscriber.complete();
      });
    }
  }

  let a: Readonly<A>, b: Readonly<B>;
  const store = getStore();

  beforeEach(() => {
    new B();

    a = new A();
    b = store.get(B);
  });

  describe('sync change of subscription status', () => {
    it('A: sync change 1', done => {
      store.on(A).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('sync value of a');
        done();
      });

      a.sync('sync value of a');
    });

    it('A: sync change 2', done => {
      store.on(A, 'sync').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('sync value of a');
        done();
      });

      expect(a.value).toEqual('initial value of a');
      expect(b.value).toEqual('initial value of b');
      a.sync('sync value of a');
    });

    it('B: sync change 1', done => {
      store.on(B).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('sync value of b');
        done();
      });

      b.sync('sync value of b');
    });

    it('B: sync change 2', done => {
      store.on(B, 'sync').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('sync value of b');
        done();
      });

      expect(a.value).toEqual('initial value of a');
      expect(b.value).toEqual('initial value of b');
      b.sync('sync value of b');
    });
  });

  describe('async change of subscription status', () => {
    it('A: async change 1', done => {
      store.on(A).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('async value of a');
        done();
      });

      a.async('async value of a');
    });

    it('A: async change 2', done => {
      store.on(A, 'async').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('async value of a');
        done();
      });

      a.async('async value of a');
    });

    it('B: async change 1', done => {
      store.on(B).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('async value of b');
        done();
      });

      b.async('async value of b');
    });

    it('B: async change 2', done => {
      store.on(B, 'async').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('async value of b');
        done();
      });

      b.async('async value of b');
    });
  });

  describe('promise change of subscription status', () => {
    it('A: promise change 1', done => {
      store.on(A).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('promise value of a');
        done();
      });

      a.promise('promise value of a');
    });

    it('A: promise change 2', done => {
      store.on(A, 'promise').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('promise value of a');
        done();
      });

      a.promise('promise value of a');
    });

    it('B: promise change 1', done => {
      store.on(B).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('promise value of b');
        done();
      });

      b.promise('promise value of b');
    });

    it('B: promise change 2', done => {
      store.on(B, 'promise').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('promise value of b');
        done();
      });

      b.promise('promise value of b');
    });
  });

  describe('observable change of subscription status', () => {
    it('A: observable change 1', done => {
      store.on(A).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('observable value of a');
        done();
      });

      a.observable('observable value of a').subscribe();
    });

    it('A: observable change 2', done => {
      store.on(A, 'observable').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('observable value of a');
        done();
      });

      a.observable('observable value of a').subscribe();
    });

    it('B: observable change 1', done => {
      store.on(B).pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('observable value of b');
        done();
      });

      b.observable('observable value of b').subscribe();
    });

    it('B: observable change 2', done => {
      store.on(B, 'observable').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('observable value of b');
        done();
      });

      b.observable('observable value of b').subscribe();
    });
  });

  describe('use a custom action name to subscribe to status changes', () => {
    it('A: observable change', done => {
      store.on(A, 'custom').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('custom action name of a');
        done();
      });

      a.action('custom action name of a');
    });

    it('B: observable change', done => {
      store.on(B, 'custom').pipe(take(1)).subscribe(o => {
        expect(o.value).toEqual('custom action name of b');
        done();
      });

      b.action('custom action name of b');
    });
  });
});
