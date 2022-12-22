import { VersionStruct, VersionRangeStruct } from '@metamask/snaps-utils';
import {
  object,
  array,
  is,
  record,
  string,
  union,
  optional,
  intersection,
  assert,
} from 'superstruct';

import registry from './registry.json';

const VerifiedSnapVersionStruct = object({
  checksum: string(),
});

const VerifiedSnapStruct = object({
  id: string(),
  versions: record(VersionStruct, VerifiedSnapVersionStruct),
});

const BlockedSnapStruct = intersection([
  union([
    object({ id: string(), versionRange: VersionRangeStruct }),
    object({ checksum: string() }),
  ]),
  object({
    reason: optional(
      object({ explanation: optional(string()), url: optional(string()) }),
    ),
  }),
]);

// TODO: Import these structs from @metamask/snaps-utils
const JsonSnapRegistryDatabaseStruct = object({
  verifiedSnaps: record(string(), VerifiedSnapStruct),
  blockedSnaps: array(BlockedSnapStruct),
});

describe('Snap Registry', () => {
  it('has valid format', () => {
    assert(registry, JsonSnapRegistryDatabaseStruct);
    expect(is(registry, JsonSnapRegistryDatabaseStruct)).toBe(true);
  });
});
