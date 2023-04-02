import { Store } from "../state-management/core/store";

describe('Listeners', () => {
  it('should create a listener and ensure it is executed on each of multiple action dispatchs with payload', () => {
    class TestAction {
      static actionId = 'testAction';
      constructor(public num: number, public str: string) {}
    }
    const store = new Store();

    let myNum = null as number | null;
    let myStr = null as string | null;
    store.addListener(TestAction, ({ num, str }) => {
      myNum = num;
      myStr = str;
    })

    expect(myNum).toEqual(null);
    expect(myStr).toEqual(null);

    store.dispatch(TestAction, 5, 'hello');
    expect(myNum).toEqual(5);
    expect(myStr).toEqual('hello');

    store.dispatch(TestAction, 6, 'world');
    expect(myNum).toEqual(6);
    expect(myStr).toEqual('world');
  })

  it('should create a listener tied to multiple actions and ensure it is executed on each action dispatch', () => {
    class TestAction1 {
      static actionId = 'testAction1';
      constructor(public num: number, public str: string) {}
    }
    class TestAction2 {
      static actionId = 'testAction2';
      constructor(public str: string) {}
    }
    const store = new Store();

    let myNum = null as number | null;
    let myStr = null as string | null;
    store.addListener(TestAction1, TestAction2, payload => {
      if('num' in payload)
        myNum = payload.num;
      myStr = payload.str;
    })

    expect(myNum).toEqual(null);
    expect(myStr).toEqual(null);

    store.dispatch(TestAction1, 5, 'hello');
    expect(myNum).toEqual(5);
    expect(myStr).toEqual('hello');

    store.dispatch(TestAction2, 'world');
    expect(myNum).toEqual(5);
    expect(myStr).toEqual('world');
  })
})