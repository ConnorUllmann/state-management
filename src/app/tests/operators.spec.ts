import { Facade } from "../state-management/core/facade";
import { arrayAppend, arrayFilter, arrayRemoveAt, arrayRemoveFirst, arraySetAt, booleanToggle, patch } from "../state-management/core/operators";
import { State } from "../state-management/core/state";
import { Store } from "../state-management/core/store";

describe('Operators', () => {
  it('should execute booleanToggle operator', () => {
    const state = State('testState', { cool: true });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.cool.set(booleanToggle);

    expect(facade.state.cool.select$.value).toEqual(false);

    facade.state.cool.set(booleanToggle);

    expect(facade.state.cool.select$.value).toEqual(true);
  })

  it('should execute patch operator', () => {
    const state = State('testState', { map: { a: 5, b: 6 } });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.map.set(patch({
      a: 4
    }))

    expect(facade.state.select$.value).toEqual({ map: { a: 4, b: 6 } });
  })

  it('should execute arrayAppend operator', () => {
    const state = State('testState', { grades: [95, 85, 88, 93] });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.grades.set(arrayAppend(100, 101));

    expect(facade.state.grades.select$.value).toEqual([95, 85, 88, 93, 100, 101]);
  })

  it('should execute arrayRemoveAt operator', () => {
    const state = State('testState', { grades: [95, 85, 88, 93] });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.grades.set(arrayRemoveAt(2));

    expect(facade.state.grades.select$.value).toEqual([95, 85, 93]);
  })

  it('should execute arrayRemoveFirst operator', () => {
    const state = State('testState', { grades: [95, 85, 88, 85, 93] });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.grades.set(arrayRemoveFirst(85, 2));

    expect(facade.state.grades.select$.value).toEqual([95, 85, 88, 93]);
  })

  it('should execute arraySetAt operator', () => {
    const state = State('testState', { grades: [95, 85, 88, 93] });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.grades.set(arraySetAt(2, 100));

    expect(facade.state.grades.select$.value).toEqual([95, 85, 100, 93]);
  })

  it('should execute arrayFilter operator', () => {
    const state = State('testState', { grades: [95, 85, 88, 93] });
    const store = new Store().addStates(state);
    const facade = Facade(store, {}, { state });

    facade.state.grades.set(arrayFilter(o => o >= 90));

    expect(facade.state.grades.select$.value).toEqual([95, 93]);
  })
})