import {
  assert,
  hexToBytes,
  isHexString,
  remove0x,
  stringToBytes,
} from '@metamask/utils';
import { Signature, utils, verify } from '@noble/secp256k1';
import jsonStringify from 'fast-json-stable-stringify';
import { promises as fs } from 'fs';
import { resolve } from 'path';

import { SnapsRegistryDatabase } from '../src';

const REGISTRY_PATH = resolve(__dirname, '../src/registry.json');
const SIGNATURE_PATH = resolve(__dirname, '../src/signature.json');

/**
 * Verify the signature of the registry.
 *
 * The `PUBLIC_KEY` environment variable must be set to the public key of the
 * private key that was used to sign the registry.
 */
async function main() {
  const publicKey = process.env.PUBLIC_KEY;
  assert(publicKey, 'PUBLIC_KEY environment variable must be set.');
  assert(isHexString(publicKey), 'PUBLIC_KEY must be a hex string.');

  const publicKeyBytes = hexToBytes(publicKey);
  assert(publicKeyBytes.length === 33, 'PUBLIC_KEY must be 33 bytes.');

  const { signature, publicKey: signaturePublicKey } = await fs
    .readFile(SIGNATURE_PATH, 'utf-8')
    .then(JSON.parse);
  const registry: SnapsRegistryDatabase = await fs
    .readFile(REGISTRY_PATH, 'utf-8')
    .then(JSON.parse);

  assert(
    signaturePublicKey === publicKey,
    'Signature public key does not match provided public key.',
  );

  // We're using `fast-json-stable-stringify` to ensure that the registry is
  // serialized deterministically.
  const jsonBytes = stringToBytes(jsonStringify(registry));

  const valid = verify(
    Signature.fromHex(remove0x(signature)),
    await utils.sha256(jsonBytes),
    publicKeyBytes,
  );

  assert(valid, 'Signature is invalid.');
  console.log('Signature is valid.');
}

main().catch((error) => {
  throw error;
});
