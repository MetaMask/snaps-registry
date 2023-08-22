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
            reports: [
              'https://metamask.io/example/report-1.pdf',
              'https://metamask.io/example/report-2.pdf',
            ],
            tags: ['accounts', 'example'],
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

    expect(() => assert(registryDb, SnapsRegistryDatabaseStruct)).not.toThrow();
  });
});
