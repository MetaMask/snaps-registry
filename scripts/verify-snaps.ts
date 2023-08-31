import { detectSnapLocation } from '@metamask/snaps-controllers/dist/snaps/location';
import { assertIsSemVerRange } from '@metamask/utils';
import deepEqual from 'fast-deep-equal';
import semver from 'semver/preload';
import { Infer } from 'superstruct';

import { VerifiedSnapStruct } from '../src';
import registry from '../src/registry.json';

type VerifiedSnap = Infer<typeof VerifiedSnapStruct>;

/**
 * Verify a snap version. This checks that the snap exists and that the
 * checksum matches the checksum in the registry.
 *
 * @param snap - The snap object.
 * @param version - The version.
 * @param checksum - The checksum.
 * @param latest - Whether the version is the latest version.
 */
async function verifySnapVersion(
  snap: VerifiedSnap,
  version: string,
  checksum: string,
  latest?: boolean,
) {
  assertIsSemVerRange(version);

  // TODO: The version of `@metamask/utils` does not match with the version used
  // by `@metamask/snaps-controllers`, so the `versionRange` property cannot be
  // validated.
  const location = detectSnapLocation(snap.id, {
    versionRange: version as any,
  });
  const { result: manifest } = await location.manifest();

  if (latest && snap.metadata.name !== manifest.proposedName) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Proposed name for "${snap.id}@${version}" does not match the metadata name in the registry. Expected "${manifest.proposedName}" (proposed name), got "${snap.metadata.name}" (registry metadata name).`,
    );
  }

  if (checksum !== manifest.source.shasum) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Checksum for "${snap.id}@${version}" does not match the checksum in the registry. Expected "${manifest.source.shasum}" (manifest checksum), got "${checksum}" (registry checksum).`,
    );
  }
}

/**
 * Verify a snap.
 *
 * @param snap - The snap.
 * @returns A list of validation errors, if any.
 */
async function verifySnap(snap: VerifiedSnap) {
  const latestVersion = Object.keys(snap.versions).reduce((result, version) => {
    if (result === null || semver.gt(version, result)) {
      return version;
    }

    return result;
  });

  for (const [version, { checksum }] of Object.entries(snap.versions)) {
    await verifySnapVersion(
      snap,
      version,
      checksum,
      latestVersion === version,
    ).catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}

/**
 * Verify all snaps that are different from the main registry.
 */
async function diff() {
  const mainRegistry = await fetch(
    'https://raw.githubusercontent.com/MetaMask/snaps-registry/main/src/registry.json',
  ).then(async (response) => response.json());

  for (const snap of Object.values(registry.verifiedSnaps)) {
    if (!deepEqual(mainRegistry.verifiedSnaps[snap.id], snap)) {
      await verifySnap(snap);
    }
  }
}

/**
 * Verify all snaps.
 */
async function main() {
  if (process.argv.includes('--diff')) {
    await diff();
    return;
  }

  for (const snap of Object.values(registry.verifiedSnaps)) {
    await verifySnap(snap);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
