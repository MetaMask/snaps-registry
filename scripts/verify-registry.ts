import { assert, assertStruct, isStrictHexString } from '@metamask/utils';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';

import { SignatureStruct, verify } from '../src';

dotenv.config();

/**
 * Get the private key from an environment variable. Either PRIVATE_KEY_PATH or
 * REGISTRY_PRIVATE_KEY must be set.
 *
 * @returns The private key.
 * @throws If neither environment variable is set, or if the private key cannot
 * be read from the file.
 */
async function getPublicKey() {
  const publicKeyPath = process.env.PUBLIC_KEY_PATH;
  const registryPublicKey = process.env.REGISTRY_PUBLIC_KEY;

  if (registryPublicKey) {
    console.log('Using key from REGISTRY_PUBLIC_KEY variable.');
    return registryPublicKey;
  }

  if (publicKeyPath) {
    console.log('Using key from PUBLIC_KEY_PATH file.');
    return await fs.readFile(publicKeyPath, 'utf-8').then((key) => key.trim());
  }

  throw new Error(
    'Either PRIVATE_KEY_PATH or REGISTRY_PRIVATE_KEY environment variable must be set.',
  );
}

/**
 * Verify the signature of the registry.
 */
async function main() {
  const registryPath = process.env.REGISTRY_PATH;
  const signaturePath = process.env.SIGNATURE_PATH;

  assert(
    registryPath !== undefined,
    'REGISTRY_PATH environment variable must be set.',
  );
  assert(
    signaturePath !== undefined,
    'SIGNATURE_PATH environment variable must be set.',
  );

  const publicKey = await getPublicKey();
  assert(isStrictHexString(publicKey), 'Public key must be a hex string.');

  const signature = JSON.parse(await fs.readFile(signaturePath, 'utf-8'));
  assertStruct(signature, SignatureStruct);
  const registry = await fs.readFile(registryPath, 'utf-8');

  const isValid = await verify({ registry, signature, publicKey });
  if (!isValid) {
    console.error('Signature is invalid.');
    // eslint-disable-next-line node/no-process-exit
    process.exit(1);
  }
  console.log('Signature is valid.');
}

main().catch((error) => {
  throw error;
});
