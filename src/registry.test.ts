import { assert } from 'superstruct';

import { JsonSnapRegistryDatabaseStruct } from '.';
import registry from './registry.json';

describe('Snap Registry', () => {
  it('has valid format', () => {
    expect(() =>
      assert(registry, JsonSnapRegistryDatabaseStruct),
    ).not.toThrow();
  });
});
