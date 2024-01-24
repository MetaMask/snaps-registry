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
            onboard: true,
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
            support: {
              knowledgeBase: 'https://metamask.io/example/support/kb',
              faq: 'https://metamask.io/example/support/faq',
              contact: 'https://metamask.io/example/support/contact',
              keyRecovery: 'https://metamask.io/example/support/keyRecovery',
            },
            sourceCode: 'https://metamask.io/example/source-code',
            category: 'interoperability',
            tags: ['accounts', 'example'],
            privacyPolicy: 'https://metamask.io/example/privacy',
            privateCode: true,
            additionalSourceCode: [
              'https://metamask.io/example/source-code2',
              'https://metamask.io/example/source-code3',
            ],
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
