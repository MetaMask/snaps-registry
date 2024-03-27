import type { SnapManifest } from '@metamask/snaps-utils';
import fs from 'fs';

import { MANIFESTS_FILE_LOCATION, getManifests } from './get-manifests';

/**
 * Entry point.
 */
async function main() {
  const forceDownload = process.argv.includes('--force-download');
  if (forceDownload) {
    await getManifests();
  } else {
    try {
      //  Check if local file exists.
      await fs.promises.readFile(MANIFESTS_FILE_LOCATION, 'utf8');
    } catch (eror) {
      await getManifests();
    }
  }

  const manifests: SnapManifest[] = JSON.parse(
    await fs.promises.readFile(MANIFESTS_FILE_LOCATION, 'utf8'),
  );

  /**
   * Write your custom code to query the `manifests` array for the data you are interested in.
   */

  //  Eg.: Find all Snaps that use `endowment:transaction-insight`
  const filteredSnaps = manifests.filter(
    (manifest) => manifest.initialPermissions['endowment:transaction-insight'],
  );
  console.log('\nQuery results');
  console.log(filteredSnaps.map((snap) => snap.proposedName));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
