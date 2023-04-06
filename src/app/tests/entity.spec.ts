import { Entity } from "../state-management/core/entity";
import { Store } from "../state-management/core/store";

describe('Entity', () => {
  it('should create an entity state/selector/facade, add entities to it, then get them by ID', () => {
    const store = new Store();
    const entity = Entity<{ id: string, name: string }>();
    const state = entity.State('myState', ['id']);
    const selector = entity.SelectorClass(state);
    const facade = entity.Facade(store, {}, state, selector);
    store.addStates(state);

    const entity1Expected = { id: 'id1', name: 'hello' }
    const entity2Expected = { id: 'id2', name: 'world' }

    facade.addEntities([entity1Expected, entity2Expected]);

    const entity1Actual = facade.getById.value({ id: entity1Expected.id })
    const entity2Actual = facade.getById.value({ id: entity2Expected.id })
    const noEntity = facade.getById.value({ id: 'not an id' })

    expect(entity1Actual).toEqual(entity1Expected);
    expect(entity2Actual).toEqual(entity2Expected);
    expect(noEntity).toEqual(null);
  })
  
  it('should be to create an entity state with an ID made of multiple fields', () => {
    const entity = Entity<{ id1: string, id2: number, name: string }>();
    const state = entity.State('myState', ['id2', 'id1']);

    const idString = state.getIdString({ id1: 'id1Test', id2: 5 });

    expect(idString).toEqual('id1Test|5')
  })

  it('should be able to get an entity with itself', () => {
    const store = new Store();
    const entity = Entity<{ id: string, name: string }>();
    const state = entity.State('myState', ['id']);
    const selector = entity.SelectorClass(state);
    const facade = entity.Facade(store, {}, state, selector);
    store.addStates(state);

    const entityExpected = { id: 'id1', name: 'hello' }

    facade.addEntities([entityExpected]);

    const entity1Actual = facade.getById.value(entityExpected)
    expect(entity1Actual).toEqual(entityExpected);
  })
  
  it('should be to get entities by multiple ID fields', () => {
    const store = new Store();
    const entity = Entity<{ id1: string, id2: number, name: string }>();
    const state = entity.State('myState', ['id2', 'id1']);
    const selector = entity.SelectorClass(state);
    const facade = entity.Facade(store, {}, state, selector);
    store.addStates(state);

    const entity1Expected = { id1: 'idA1', id2: 5, name: 'hello' }
    const entity2Expected = { id1: 'idB1', id2: 6, name: 'world' }

    facade.addEntities([entity1Expected, entity2Expected]);

    const entity1Actual = facade.getById.value({ id1: entity1Expected.id1, id2: entity1Expected.id2 })
    const entity2Actual = facade.getById.value({ id1: entity2Expected.id1, id2: entity2Expected.id2 })
    const partialMatchEntity1 = facade.getById.value({ id1: 'not an id', id2: entity1Expected.id2 })
    const partialMatchEntity2 = facade.getById.value({ id1: entity1Expected.id1, id2: 1000 })
    const noMatchEntity2 = facade.getById.value({ id1: 'not an id', id2: 1000 })

    expect(entity1Actual).toEqual(entity1Expected);
    expect(entity2Actual).toEqual(entity2Expected);
    expect(partialMatchEntity1).toEqual(null);
    expect(partialMatchEntity2).toEqual(null);
    expect(noMatchEntity2).toEqual(null);
  })
  
  it('should be able to patch fields of an entity', () => {
    const store = new Store();
    const entity = Entity<{ id: string, name: string, age: number }>();
    const state = entity.State('myState', ['id']);
    const selector = entity.SelectorClass(state);
    const facade = entity.Facade(store, {}, state, selector);
    store.addStates(state);

    const entity1Expected = { id: 'id1', name: 'hello', age: 5 }
    const entity2Expected = { id: 'id2', name: 'world', age: 6 }

    facade.addEntities([entity1Expected, entity2Expected]);

    const entity1IdString = facade.getIdString.value({ id: 'id1'})
    const entity2IdString = facade.getIdString.value({ id: 'id2'})

    facade.patchEntity(entity1IdString, { name: 'hello NEW' })

    const entity1Actual = facade.getByIdString.value(entity1IdString);
    const entity2Actual = facade.getByIdString.value(entity2IdString);

    expect(entity1Actual).toEqual({ ...entity1Expected, name: 'hello NEW' })
    expect(entity2Actual).toEqual(entity2Expected)

    facade.patchEntity(entity2IdString, { name: 'world NEW', age: 7 });

    const entity2Actual2 = facade.getByIdString.value(entity2IdString);

    expect(entity2Actual2).toEqual({ ...entity2Expected, name: 'world NEW', age: 7 })
  })
})