import { assert } from 'superstruct';

import { SnapsRegistryDatabaseStruct } from '.';
import registry from './registry.json';

describe('Snaps Registry', () => {
  it('has valid format', () => {
    expect(() => assert(registry, SnapsRegistryDatabaseStruct)).not.toThrow();
  });

  it('has a valid account snap', () => {
    /* eslint-disable @typescript-eslint/naming-convention */
    const registryDb = {
      verifiedSnaps: {
        'npm:example-snap': {
          id: 'npm:example-snap',
          metadata: {
            name: 'Example Snap',
            type: 'account',
            author: 'Example Author',
            website: 'https://metamask.io',
            summary: 'Example Snap',
            description: 'Longer Example Snap description.',
            audits: [
              'https://metamask.io/example/report-1.pdf',
              'https://metamask.io/example/report-2.pdf',
            ],
            support: 'https://metamask.io/example/support',
            sourceCode: 'https://metamask.io/example/source-code',
            tags: ['accounts', 'example'],
          },
          versions: {
            '0.1.0': {
              checksum: 'A83r5/ZIcKeKw3An13HBeV4CAofj7jGK5hOStmHY6A0=',
            },
          },
        },
      },
      blockedSnaps: [
        {
          id: 'npm:example-blocked-snap',
          versionRange: '^0.1.0',
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
    const registryDb = {
      verifiedSnaps: {
        'npm:example-snap': {
          id: 'npm:example-snap',
          metadata: {
            name: 'Example Snap',
          },
          versions: {
            '0.1.0': {
              checksum: 'A83r5/ZIcKeKw3An13HBeV4CAofj7jGK5hOStmHY6A0=',
            },
          },
        },
      },
      blockedSnaps: [
        {
          id: 'npm:example-blocked-snap',
          versionRange: '^0.1.0',
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
    /* eslint-disable @typescript-eslint/naming-convention */
    const registryDb = {
      verifiedSnaps: {
        'npm:example-snap': {
          id: 'npm:example-snap',
          metadata: {
            name: 'Example Snap',
            unexpected: 'field',
          },
          versions: {
            '0.1.0': {
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
