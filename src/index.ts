import {
  VersionStruct,
  VersionRangeStruct,
  ChecksumStruct,
} from '@metamask/utils';
import type { Infer } from 'superstruct';
import {
  object,
  array,
  record,
  string,
  union,
  optional,
  enums,
  refine,
} from 'superstruct';

// For now, validate that each snap is using an NPM id.
const NpmIdStruct = refine(string(), 'Npm ID', (value) =>
  value.startsWith('npm:'),
);

const VerifiedSnapVersionStruct = object({
  checksum: ChecksumStruct,
});

export const AuthorStruct = object({
  name: string(),
  website: string(),
});

export type Author = Infer<typeof AuthorStruct>;

export const AuditStruct = object({
  auditor: string(),
  report: string(),
});

export type Audit = Infer<typeof AuditStruct>;

export const VerifiedSnapStruct = object({
  id: NpmIdStruct,
  metadata: object({
    name: string(),
    type: optional(enums(['account'])),
    author: optional(AuthorStruct),
    website: optional(string()),
    summary: optional(string()),
    description: optional(string()),
    audits: optional(array(AuditStruct)),
    category: optional(
      enums(['interoperability', 'notifications', 'transaction insights']),
    ),
    tags: optional(array(string())),
    support: optional(string()),
    sourceCode: optional(string()),
  }),
  versions: record(VersionStruct, VerifiedSnapVersionStruct),
});

export const BlockReasonStruct = object({
  explanation: optional(string()),
  url: optional(string()),
});

export type BlockReason = Infer<typeof BlockReasonStruct>;

export const BlockedSnapStruct = union([
  object({
    id: NpmIdStruct,
    versionRange: VersionRangeStruct,
    reason: optional(BlockReasonStruct),
  }),
  object({ checksum: ChecksumStruct, reason: optional(BlockReasonStruct) }),
]);

export const SnapsRegistryDatabaseStruct = object({
  verifiedSnaps: record(NpmIdStruct, VerifiedSnapStruct),
  blockedSnaps: array(BlockedSnapStruct),
});

export type SnapsRegistryDatabase = Infer<typeof SnapsRegistryDatabaseStruct>;

export * from './verify';
