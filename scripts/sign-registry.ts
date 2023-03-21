import {
  assert,
  bytesToHex,
  hexToBytes,
  isHexString,
  stringToBytes,
} from '@metamask/utils';
import { getPublicKey, sign, utils } from '@noble/secp256k1';
import jsonStringify from 'fast-json-stable-stringify';
import { promises as fs } from 'fs';
import { resolve } from 'path';

import { SnapsRegistryDatabase } from '../src';

const REGISTRY_PATH = resolve(__dirname, '../src/registry.json');
const SIGNATURE_PATH = resolve(__dirname, '../src/signature.json');

/**
 * Signs the registry with the given private key.
 *
 * The `PRIVATE_KEY` environment variable must be set to the private key to use
 * for signing the registry.
 */
async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  assert(privateKey, 'PRIVATE_KEY environment variable must be set.');
  assert(isHexString(privateKey), 'PRIVATE_KEY must be a hex string.');

  const privateKeyBytes = hexToBytes(privateKey);
  assert(privateKeyBytes.length === 32, 'PRIVATE_KEY must be 32 bytes.');

  const publicKey = bytesToHex(getPublicKey(privateKeyBytes, true));

  const registry: SnapsRegistryDatabase = await fs
    .readFile(REGISTRY_PATH, 'utf-8')
    .then(JSON.parse);

  // We're using `fast-json-stable-stringify` to ensure that the registry is
  // serialized deterministically.
  const jsonBytes = stringToBytes(jsonStringify(registry));

  const signature = await sign(await utils.sha256(jsonBytes), privateKeyBytes);
  const json = JSON.stringify(
    {
      signature: bytesToHex(signature),
      publicKey,
    },
    null,
    2,
  );

  await fs.writeFile(SIGNATURE_PATH, `${json}\n`, 'utf-8');
  console.log(
    `Signature signed with private key of "${publicKey}" and written to "${SIGNATURE_PATH}".`,
  );
}

main().catch((error) => {
  throw error;
});
