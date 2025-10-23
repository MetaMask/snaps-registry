import { detectSnapLocation, fetchSnap } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import type { FetchedSnapFiles } from '@metamask/snaps-utils';
import {
  getLocalizedSnapManifest,
  getSnapChecksum,
} from '@metamask/snaps-utils';
import type { Infer } from '@metamask/superstruct';
import { assertIsSemVerVersion, getErrorMessage } from '@metamask/utils';
import deepEqual from 'fast-deep-equal';
import { imageSize as imageSizeSync } from 'image-size';
import { resolve } from 'path';
import semver from 'semver/preload';
import { promisify } from 'util';

import type { VerifiedSnapStruct } from '../src';
import registry from '../src/registry.json';

const imageSize = promisify(imageSizeSync);

type VerifiedSnap = Infer<typeof VerifiedSnapStruct>;

/**
 * The branch to fetch the registry from.
 */
const REGISTRY_BRANCH = process.env.GITHUB_BASE_REF ?? 'main';

/**
 * Verify a snap version. This checks that the snap exists and that the
 * checksum matches the checksum in the registry.
 *
 * @param snap - The snap object.
 * @param version - The version.
 * @param registryChecksum - The registry checksum.
 * @param latest - Whether the version is the latest version.
 */
async function verifySnapVersion(
  snap: VerifiedSnap,
  version: string,
  registryChecksum: string,
  latest?: boolean,
) {
  assertIsSemVerVersion(version);

  // TODO: The version of `@metamask/utils` does not match with the version used
  // by `@metamask/snaps-controllers`, so the `versionRange` property cannot be
  // validated.
  const location = detectSnapLocation(snap.id, {
    versionRange: version as any,
  });

  // This will throw if the snap checksum is invalid etc
  const fetchedSnap = (await fetchSnap(
    snap.id as SnapId,
    location,
  )) as FetchedSnapFiles;

  const manifest = fetchedSnap.manifest.result;
  const validatedLocalizationFiles = fetchedSnap.localizationFiles.map(
    (file) => file.result,
  );

  // For now, just validate the English translation
  const localizedManifest = getLocalizedSnapManifest(
    manifest,
    'en',
    validatedLocalizationFiles,
  );

  if (latest && snap.metadata.name !== localizedManifest.proposedName) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Proposed name for "${snap.id}@${version}" does not match the metadata name in the registry. Expected "${manifest.proposedName}" (proposed name), got "${snap.metadata.name}" (registry metadata name).`,
    );
  }

  if (registryChecksum !== manifest.source.shasum) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Checksum for "${snap.id}@${version}" does not match the checksum in the registry. Expected "${manifest.source.shasum}" (manifest checksum), got "${registryChecksum}" (registry checksum).`,
    );
  }

  const computedChecksum = await getSnapChecksum(fetchedSnap);

  if (computedChecksum !== manifest.source.shasum) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Checksum for "${snap.id}@${version}" does not match computed checksum. Expected "${computedChecksum}" (computed checksum), got "${manifest.source.shasum}" (manifest checksum).`,
    );
  }
}

/**
 * Get the size of an image.
 *
 * @param path - The path to the image.
 * @param snapId - The snap ID.
 */
async function getImageSize(path: string, snapId: string) {
  try {
    return await imageSize(path);
  } catch (error) {
    throw new Error(
      `Could not determine the size of screenshot "${path}" for "${snapId}": ${getErrorMessage(
        error,
      )}.`,
    );
  }
}

/**
 * Verify that the screenshots for a snap exist and have the correct dimensions.
 *
 * @param snapId - The snap ID.
 * @param screenshots - The screenshots.
 * @throws If a screenshot does not exist or has the wrong dimensions.
 */
async function verifyScreenshots(snapId: string, screenshots: string[]) {
  const basePath = resolve(__dirname, '..', 'src');

  for (const screenshot of screenshots) {
    const path = resolve(basePath, screenshot);
    const size = await getImageSize(path, snapId);
    if (!size?.width || !size?.height) {
      throw new Error(
        `Could not determine the size of screenshot "${screenshot}" for "${snapId}".`,
      );
    }

    if (size.width !== 960 || size.height !== 540) {
      throw new Error(
        `Screenshot "${screenshot}" for "${snapId}" does not have the correct dimensions. Expected 960x540, got ${size.width}x${size.height}.`,
      );
    }
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

  const { screenshots } = snap.metadata;
  if (screenshots) {
    await verifyScreenshots(snap.id, screenshots).catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}

/**
 * Verify all snaps that are different from the main registry.
 */
async function diff() {
  const url = `https://raw.githubusercontent.com/MetaMask/snaps-registry/${REGISTRY_BRANCH}/src/registry.json`;

  console.log(`Fetching registry from "${url}".`);
  const mainRegistry = await fetch(url).then(async (response) =>
    response.json(),
  );

  for (const snap of Object.values(registry.verifiedSnaps)) {
    if (!deepEqual(mainRegistry.verifiedSnaps[snap.id], snap)) {
      await verifySnap(snap as VerifiedSnap);
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
    await verifySnap(snap as VerifiedSnap);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
