import { detectSnapLocation, fetchSnap } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import fs from 'fs';
import path from 'path';
import semver from 'semver/preload';

import registry from '../../src/registry.json';

export const MANIFESTS_FILE_LOCATION = path.join(__dirname, 'data.json');

/**
 * Function to fetch Snaps manifests and write it to a local JSON file.
 */
export async function getManifests() {
  console.log('Fetching Snaps. Please wait ...');
  const allManifests = [];
  for (const snap of Object.values(registry.verifiedSnaps)) {
    console.log(snap.metadata.name);
    const latestVersion = Object.keys(snap.versions).reduce(
      (result, version) => {
        if (result === null || semver.gt(version, result)) {
          return version;
        }
        return result;
      },
    );

    const location = detectSnapLocation(snap.id, {
      versionRange: latestVersion as any,
    });
    const fetchedSnap = await fetchSnap(snap.id as SnapId, location);
    allManifests.push(fetchedSnap.manifest.result);
  }
  fs.writeFileSync(MANIFESTS_FILE_LOCATION, JSON.stringify(allManifests));
  console.log('Fetching Snap manifests and writing file - Done');
}
