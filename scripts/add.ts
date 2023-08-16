import { NpmLocation } from '@metamask/snaps-controllers/dist/snaps/location';
import { promises as fs } from 'fs';
import path from 'path';

const REGISTRY_FILE = path.resolve('./src/registry.json');

/**
 * Verify the signature of the registry.
 */
async function main() {
  const npmId = process.argv[2] as string;
  const versionRange = process.argv[3] as any;

  const location = new NpmLocation(new URL(`npm:${npmId}`), {
    // eslint-disable-next-line node/global-require, @typescript-eslint/no-require-imports
    fetch: require('node-fetch'),
    versionRange,
  });

  const manifest = (await location.manifest()).result;

  const { version, proposedName: name } = manifest;
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const id = `npm:${manifest.source.location.npm.packageName}`;
  const checksum = manifest.source.shasum;

  const rawRegistry = await fs.readFile(REGISTRY_FILE, 'utf-8');

  const registry = JSON.parse(rawRegistry);

  const existing = registry.verifiedSnaps[id];

  registry.verifiedSnaps[id] = {
    ...existing,
    id,
    metadata: {
      ...existing?.metadata,
      name,
    },
    versions: {
      ...existing?.versions,
      [version]: {
        checksum,
      },
    },
  };

  await fs.writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

main().catch((error) => {
  throw error;
});
