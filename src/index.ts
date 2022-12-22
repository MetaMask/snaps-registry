import {
  VersionStruct,
  VersionRangeStruct,
  base64,
} from '@metamask/snaps-utils';
import {
  object,
  array,
  record,
  string,
  union,
  optional,
  Infer,
  size,
} from 'superstruct';

// TODO: Export this in 'snaps-utils' instead
const ChecksumStruct = size(
  base64(string(), { paddingRequired: true }),
  44,
  44,
);

export const VerifiedSnapVersionStruct = object({
  checksum: ChecksumStruct,
});

export const VerifiedSnapStruct = object({
  id: string(),
  versions: record(VersionStruct, VerifiedSnapVersionStruct),
});

export const BlockReasonStruct = object({
  explanation: optional(string()),
  url: optional(string()),
});

export type SnapRegistryBlockReason = Infer<typeof BlockReasonStruct>;

export const BlockedSnapStruct = union([
  object({
    id: string(),
    versionRange: VersionRangeStruct,
    reason: optional(BlockReasonStruct),
  }),
  object({ checksum: ChecksumStruct, reason: optional(BlockReasonStruct) }),
]);

export const JsonSnapRegistryDatabaseStruct = object({
  verifiedSnaps: record(string(), VerifiedSnapStruct),
  blockedSnaps: array(BlockedSnapStruct),
});

export type JsonSnapRegistryDatabase = Infer<
  typeof JsonSnapRegistryDatabaseStruct
>;
