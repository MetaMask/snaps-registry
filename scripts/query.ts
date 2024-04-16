import { detectSnapLocation, fetchSnap } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import type { SnapManifest } from '@metamask/snaps-utils';
import type { SemVerRange } from '@metamask/utils';
import { hasProperty } from '@metamask/utils';
import ora from 'ora';
import semver from 'semver';
import { runInNewContext } from 'vm';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { VerifiedSnap } from '../src';
import database from '../src/registry.json';

type Options = {
  verbose?: boolean | undefined;
  format: string;
  fetch?: boolean | undefined;
  all?: boolean | undefined;
  filter?: string | undefined;
  limit?: number | undefined;
};

const verifiedSnaps = database.verifiedSnaps as Record<string, VerifiedSnap>;

/**
 * Get a Snap ID from either a Snap object or a Snap manifest.
 *
 * @param value - The Snap object or Snap manifest.
 * @returns The Snap ID.
 */
function getSnapId(value: VerifiedSnap | SnapManifest) {
  if (hasProperty(value, 'id')) {
    return value.id;
  }

  return `npm:${value.source.location.npm.packageName}`;
}

/**
 * Format Snap as string.
 *
 * @param value - The Snap object.
 * @returns The Snap ID.
 */
function formatString(value: VerifiedSnap | SnapManifest) {
  return getSnapId(value);
}

/**
 * Format Snap as JSON, optionally with verbose output.
 *
 * @param value - The Snap object.
 * @param verbose - Whether to include verbose output.
 * @returns The Snap ID or the full Snap object.
 */
function formatJson(value: VerifiedSnap | SnapManifest, verbose?: boolean) {
  if (verbose) {
    return JSON.stringify(value, null, 2);
  }

  return JSON.stringify({ snapId: getSnapId(value) }, null, 2);
}

/**
 * Format Snap based on the specified format.
 *
 * @param snap - The Snap object.
 * @param options - The command line options.
 * @returns The formatted Snap.
 */
function formatSnap(snap: VerifiedSnap | SnapManifest, options: Options) {
  switch (options.format) {
    case 'json':
      return formatJson(snap, options.verbose);
    case 'string':
      return formatString(snap);
    default:
      throw new Error(`Unsupported format: "${String(options.format)}"`);
  }
}

/**
 * Format Snaps based on the specified format.
 *
 * @param snaps - The Snap objects.
 * @param options - The command line options.
 * @returns The formatted Snaps.
 */
function formatSnaps(snaps: VerifiedSnap[] | SnapManifest[], options: Options) {
  return snaps
    .map((snap) => formatSnap(snap, options))
    .slice(0, options.limit ?? snaps.length)
    .join('\n');
}

/**
 * Get all Snaps on the registry.
 *
 * If `fetch` is true, this function will fetch the Snap manifests. Otherwise,
 * it will use the local registry.
 *
 * @param fetch - Whether to fetch Snap manifests.
 * @returns The Snap objects.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow
async function getAllSnaps(fetch: boolean) {
  if (fetch) {
    const spinner = ora(
      'Fetching Snap manifests. This may take a while.',
    ).start();

    const promises = Object.values(verifiedSnaps).map(async (snap) => {
      const latestVersion = Object.keys(snap.versions).reduce<SemVerRange>(
        (result, version) => {
          if (result === null || semver.gt(version, result)) {
            return version as SemVerRange;
          }
          return result;
        },
        // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
        '0.0.0' as SemVerRange,
      );

      const location = detectSnapLocation(snap.id, {
        versionRange: latestVersion,
      });

      const { manifest } = await fetchSnap(snap.id as SnapId, location);
      return manifest.result;
    });

    const results = await Promise.all(promises);
    spinner.stop();

    return results;
  }

  return Object.values(verifiedSnaps);
}

/**
 * Filter Snaps based on custom logic.
 *
 * @param code - The custom logic.
 * @param snaps - The Snap objects.
 * @returns The filtered Snaps.
 */
function filter(code: string, snaps: VerifiedSnap[] | SnapManifest[]) {
  return runInNewContext(
    `
      snaps.filter((snap) => ${code});
    `,
    {
      snaps,
    },
  );
}

/**
 * Entry point.
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose output',
    })
    .option('format', {
      choices: ['json', 'string'],
      default: 'string',
      description: 'Output format',
    })
    .option('fetch', {
      type: 'boolean',
      description: 'Fetch Snap manifests, instead of using the local registry',
    })
    .option('all', {
      type: 'boolean',
      description: 'List all Snaps',
      conflicts: ['filter', 'limit'],
    })
    .option('filter', {
      type: 'string',
      description: 'Filter Snaps based on some custom logic',
      conflicts: ['all'],
    })
    .option('exclude', {
      type: 'string',
      description: 'Exclude Snaps based on some custom logic',
      conflicts: ['all'],
    })
    .option('limit', {
      type: 'number',
      description: 'Limit the number of Snaps to list',
      conflicts: ['all'],
    })
    .example([
      ['$0 --all', 'List all Snaps'],
      ['$0 --fetch --all', 'Fetch all Snap manifests and list them'],
      [
        '$0 --fetch --filter "snap.initialPermissions[\'endowment:transaction-insight\']"',
        'Get all Snaps that request the "endowment:transaction-insight" permission',
      ],
      [
        '$0 --fetch --filter "snap.initialPermissions[\'endowment:network-access\']" --exclude "snap.initialPermissions[\'endowment:network-access\']"',
        'Get all Snaps that request the "endowment:transaction-insight" permission, but do not request the "endowment:network-access" permission',
      ],
      [
        '$0 ---filter "\\!Boolean(snap.metadata.screenshots)" --exclude "snap.id.startsWith(\'npm:@metamask\')" --format json',
        'Get all Snaps that do not have screenshots and are not published by MetaMask, as JSON',
      ],
      ['$0 --all --format json', 'Output Snaps as JSON'],
      ['$0 --all --limit 5', 'Limit the number of Snaps to list'],
    ])
    .wrap(yargs.terminalWidth())
    .parseAsync();

  const snaps = await getAllSnaps(Boolean(argv.fetch));
  if (argv.all) {
    return console.log(formatSnaps(snaps, argv));
  }

  if (argv.filter) {
    const result = filter(argv.filter, snaps);

    if (argv.exclude) {
      const exclude = filter(`!(${argv.exclude})`, result);
      return console.log(formatSnaps(exclude, argv));
    }

    return console.log(formatSnaps(result, argv));
  }

  return undefined;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
