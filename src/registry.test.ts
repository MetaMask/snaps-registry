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

const BlockReasonStruct = object({
  explanation: optional(string()),
  url: optional(string()),
});

const BlockedSnapStruct = intersection([
  union([
    object({
      id: string(),
      versionRange: VersionRangeStruct,
      reason: optional(BlockReasonStruct),
    }),
    object({ checksum: string(), reason: optional(BlockReasonStruct) }),
  ]),
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
