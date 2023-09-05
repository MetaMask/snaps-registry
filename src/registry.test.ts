import type { SemVerRange, SemVerVersion } from '@metamask/utils';
import { assert } from 'superstruct';

import type { SnapsRegistryDatabase } from '.';
import { SnapsRegistryDatabaseStruct } from '.';
import registry from './registry.json';

describe('Snaps Registry', () => {
  it('has valid format', () => {
    expect(() => assert(registry, SnapsRegistryDatabaseStruct)).not.toThrow();
  });

  it('has a valid account snap', () => {
    /* eslint-disable @typescript-eslint/naming-convention */
    const registryDb: SnapsRegistryDatabase = {
      verifiedSnaps: {
        'npm:example-snap': {
          id: 'npm:example-snap',
          metadata: {
            name: 'Example Snap',
            type: 'account',
            author: {
              name: 'MetaMask',
              website: 'https://metamask.io',
            },
            website: 'https://metamask.io',
            summary: 'Example Snap',
            description: 'Longer Example Snap description.',
            audits: [
              {
                auditor: 'Example Auditor',
                report: 'https://metamask.io/example/report-1.pdf',
              },
              {
                auditor: 'Example Auditor',
                report: 'https://metamask.io/example/report-2.pdf',
              },
            ],
            support: 'https://metamask.io/example/support',
            sourceCode: 'https://metamask.io/example/source-code',
            tags: ['accounts', 'example'],
          },
          versions: {
            ['0.1.0' as SemVerVersion]: {
              checksum: 'A83r5/ZIcKeKw3An13HBeV4CAofj7jGK5hOStmHY6A0=',
            },
          },
        },
      },
      blockedSnaps: [
        {
          id: 'npm:example-blocked-snap',
          versionRange: '^0.1.0' as SemVerRange,
          reason: {
            explanation: 'Example explanation',
            url: 'https://metamask.io/example/explanation',
          },
        },
        {
          checksum: 'B3ar53ZIcKeKw3An3aqBeV4CAofj7jGK5hOAAxQY6A0=',
          reason: {
            explanation: 'Example explanation',
            url: 'https://metamask.io/example/explanation',
          },
        },
      ],
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    expect(() => assert(registryDb, SnapsRegistryDatabaseStruct)).not.toThrow();
  });

  it('has a only mandatory fields', () => {
    /* eslint-disable @typescript-eslint/naming-convention */
    const registryDb: SnapsRegistryDatabase = {
      verifiedSnaps: {
        'npm:example-snap': {
          id: 'npm:example-snap',
          metadata: {
            name: 'Example Snap',
          },
          versions: {
            ['0.1.0' as SemVerVersion]: {
              checksum: 'A83r5/ZIcKeKw3An13HBeV4CAofj7jGK5hOStmHY6A0=',
            },
          },
        },
      },
      blockedSnaps: [
        {
          id: 'npm:example-blocked-snap',
          versionRange: '^0.1.0' as SemVerRange,
        },
        {
          checksum: 'B3ar53ZIcKeKw3An3aqBeV4CAofj7jGK5hOAAxQY6A0=',
        },
      ],
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    expect(() => assert(registryDb, SnapsRegistryDatabaseStruct)).not.toThrow();
  });

  it('should throw when the metadata has an unexpected field', () => {
    const registryDb: SnapsRegistryDatabase = {
      verifiedSnaps: {
        'npm:example-snap': {
          id: 'npm:example-snap',
          metadata: {
            name: 'Example Snap',
            // @ts-expect-error - Unexpected field.
            unexpected: 'field',
          },
          versions: {
            ['0.1.0' as SemVerVersion]: {
              checksum: 'A83r5/ZIcKeKw3An13HBeV4CAofj7jGK5hOStmHY6A0=',
            },
          },
        },
      },
      blockedSnaps: [],
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    expect(() => assert(registryDb, SnapsRegistryDatabaseStruct)).toThrow(
      'At path: verifiedSnaps.npm:example-snap.metadata.unexpected -- Expected a value of type `never`, but received: `"field"`',
    );
  });
});
