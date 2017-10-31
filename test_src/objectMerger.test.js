import {mergePropertiesFromObject} from '../bld/objectMerger';

describe('objectMerger', () => {
  it('should merge properties from another object', () => {
    let obj1 = {
      testOwn: 'testOwn',
      test1: 'test1',
      testExcept: 'testExcept'
    };
    let obj2 = {
      test1: 'testtest',
      test2: 'test2',
      testExcept: 'testExcept2'
    };
    let res = {
      testOwn: 'testOwn',
      test1: 'testtest',
      test2: 'test2',
      testExcept: 'testExcept'
    };

    let update = mergePropertiesFromObject(obj1, ['test1', 'test2', 'test3'], obj2);
    expect(obj1).toEqual(res);
    expect(update).toEqual(true);
  });

  it('should not merge properties with the same value', () => {
    let obj1 = {
      testOwn: 'testOwn',
      test1: 'test1',
      testExcept: 'testExcept'
    };
    let obj2 = {
      test1: 'test1',
      test2: 'test2',
      testExcept: 'testExcept2'
    };
    let res = {
      testOwn: 'testOwn',
      test1: 'test1',
      testExcept: 'testExcept'
    };

    let update = mergePropertiesFromObject(obj1, ['test1'], obj2);
    expect(obj1).toEqual(res);
    expect(update).toEqual(false);
  });

  it('should not merge properties with the same value', () => {
    let obj1 = {
      testOwn: 'testOwn',
      test1: {test:'test1'},
      testExcept: 'testExcept'
    };
    let obj2 = {
      test1: {test:'test1'},
      test2: 'test2',
      testExcept: 'testExcept2'
    };
    let res = {
      testOwn: 'testOwn',
      test1: {test:'test1'},
      testExcept: 'testExcept'
    };

    let update = mergePropertiesFromObject(obj1, ['test1'], obj2);
    expect(obj1).toEqual(res);
    expect(update).toEqual(false);
  });


  it('should merge properties with the different values', () => {
    let obj1 = {
      testOwn: 'testOwn',
      test1: {test:'test2'},
      testExcept: 'testExcept'
    };
    let obj2 = {
      test1: {test:'test1'},
      test2: 'test2',
      testExcept: 'testExcept2'
    };
    let res = {
      testOwn: 'testOwn',
      test1: {test:'test1'},
      testExcept: 'testExcept'
    };

    let update = mergePropertiesFromObject(obj1, ['test1'], obj2);
    expect(obj1).toEqual(res);
    expect(update).toEqual(true);
  });
});
