import { Facade } from "../state-management/core/facade";
import { createSelector } from "../state-management/core/selector";
import { State } from "../state-management/core/state";
import { Store } from "../state-management/core/store";

describe('State selectors', () => {
  it('should create selector & setter for boolean fields', () => {  
    const state = State('testState', { cool: true });
    const store = new Store().addStates(state);    
    class TestSelector {
      static getCoolInverse = createSelector(state.selectors.cool.selector, cool => !cool);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getCoolInverse.value).toEqual(false);

    facade.state.cool.set(false);

    expect(facade.getCoolInverse.value).toEqual(true);
  })

  it('should create selector & setter for number fields', () => {  
    const state = State('testState', { age: 5 });
    const store = new Store().addStates(state);    
    class TestSelector {
      static getAgePlus3 = createSelector(state.selectors.age.selector, age => age + 3);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getAgePlus3.value).toEqual(8);

    facade.state.age.set(9);

    expect(facade.getAgePlus3.value).toEqual(12);
  })

  it('should create selector & setter for string fields', () => {  
    const state = State('testState', { name: 'hello' });
    const store = new Store().addStates(state);    
    class TestSelector {
      static getNamePlusWorld = createSelector(state.selectors.name.selector, name => `${name} world`);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getNamePlusWorld.value).toEqual('hello world');

    facade.state.name.set('hi');

    expect(facade.getNamePlusWorld.value).toEqual('hi world');
  })

  it('should create selector & setter for array fields', () => {  
    const state = State('testState', { grades: [95, 85, 88, 93] });
    const store = new Store().addStates(state);    
    class TestSelector {
      static getGradesPlus100 = createSelector(state.selectors.grades.selector, grades => [...grades, 100]);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getGradesPlus100.value).toEqual([95, 85, 88, 93, 100]);

    facade.state.grades.set([90]);

    expect(facade.getGradesPlus100.value).toEqual([90, 100]);
  })

  it('should create selector & setter for index signature fields', () => {  
    const state = State<{ map: { [key: string]: number } }>('testState', { map: { 'a': 5 } });
    const store = new Store().addStates(state);    
    class TestSelector {
      static getMapPlusB = createSelector(state.selectors.map.selector, (map): { [key: string]: number } => ({ ...map, 'b': 6 }));
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getMapPlusB.value).toEqual({ 'a': 5, 'b': 6 });

    facade.state.map.set({ 'c': 7 });

    expect(facade.getMapPlusB.value).toEqual({ 'c': 7, 'b': 6 });
  })

  it('should create selector & setter for object fields', () => {  
    const state = State('testState', { map: { a: 5 } });
    const store = new Store().addStates(state);
    class TestSelector {
      static getMapPlusB = createSelector(state.selectors.map.selector, (map) => ({ ...map, b: 6 }));
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getMapPlusB.value).toEqual({ a: 5, b: 6 });

    facade.state.map.set({ a: 4 });

    expect(facade.getMapPlusB.value).toEqual({ a: 4, b: 6 });
  })

  it('should create selector & setter for undefinable fields', () => {  
    const state = State<{ a: number | undefined }>('testState', { a: undefined });
    const store = new Store().addStates(state);
    class TestSelector {
      static getAor4 = createSelector(state.selectors.a.selector, a => a ?? 4);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.state.a.select$.value).toEqual(undefined);
    expect(facade.getAor4.value).toEqual(4);

    facade.state.a.set(6);

    expect(facade.getAor4.value).toEqual(6);
  })

  it('should create selector & setter for undefinable object fields', () => {  
    const state = State<{
      a: {
        b: number,
        c: {
          d: string | undefined
        }
      } | undefined
    }>('testState', { a: undefined });
    const store = new Store().addStates(state);
    class TestSelector {
      static getAB = createSelector(state.selectors.a.b.selector, b => b);
      static getAC = createSelector(state.selectors.a.c.selector, c => c);
      static getACD = createSelector(state.selectors.a.c.d.selector, d => d);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getAB.value).toEqual(undefined);
    expect(facade.getAC.value).toEqual(undefined);
    expect(facade.getACD.value).toEqual(undefined);

    facade.state.a.set({
      b: 5,
      c: { d: undefined }
    });

    expect(facade.getAB.value).toEqual(5);
    expect(facade.getAC.value).toEqual({ d: undefined });
    expect(facade.getACD.value).toEqual(undefined);

    facade.state.a.set({
      b: 5,
      c: { d: 'hello' }
    });

    expect(facade.getAB.value).toEqual(5);
    expect(facade.getAC.value).toEqual({ d: 'hello' });
    expect(facade.getACD.value).toEqual('hello');
  })

  it('should create selector & setter for nullable object fields', () => {  
    const state = State<{
      a: {
        b: number,
        c: {
          d: string | null
        }
      } | null
    }>('testState', { a: null });
    const store = new Store().addStates(state);
    class TestSelector {
      static getAB = createSelector(state.selectors.a.b.selector, b => b);
      static getAC = createSelector(state.selectors.a.c.selector, c => c);
      static getACD = createSelector(state.selectors.a.c.d.selector, d => d);
    }
    const facade = Facade(store, {}, { state }, TestSelector);

    expect(facade.getAB.value).toEqual(undefined);
    expect(facade.getAC.value).toEqual(undefined);
    expect(facade.getACD.value).toEqual(undefined);

    facade.state.a.set({
      b: 5,
      c: { d: null }
    });

    expect(facade.getAB.value).toEqual(5);
    expect(facade.getAC.value).toEqual({ d: null });
    expect(facade.getACD.value).toEqual(null);

    facade.state.a.set({
      b: 5,
      c: { d: 'hello' }
    });

    expect(facade.getAB.value).toEqual(5);
    expect(facade.getAC.value).toEqual({ d: 'hello' });
    expect(facade.getACD.value).toEqual('hello');
  })
})