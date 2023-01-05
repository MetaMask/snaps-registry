import { assert } from 'superstruct';

import { SnapsRegistryDatabaseStruct } from '.';
import registry from './registry.json';

describe('Snaps Registry', () => {
  it('has valid format', () => {
    expect(() => assert(registry, SnapsRegistryDatabaseStruct)).not.toThrow();
  });
});
